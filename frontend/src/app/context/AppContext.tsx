import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  orderBy,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";
import axios from "axios";
import { toast } from "sonner";

export type UserRole = "user" | "admin";

export type EmailStatus = "valid" | "invalid" | "risky" | "unknown";

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  quota: number;
  description: string;
  features: string[];
  popular: boolean;
  active: boolean;
  planType?: "subscription" | "onetime"; // new field
  dailyCredits?: number; // for subscription plans
  creditAmount?: number; // for one-time plans
  billingPeriod?: "monthly" | "daily" | "one-time"; // billing frequency
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: string;
  monthlyQuota: number;
  usedQuota: number;
  createdAt: Date;
  disabled?: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  plan: string;
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed";
  paymentDate: Date;
  transactionId: string;
}

export interface EmailVerification {
  id: string;
  email: string;
  status: EmailStatus;
  formatValid: boolean;
  domainExists: boolean;
  mxRecordFound: boolean;
  disposable: boolean;
  roleBased: boolean;
  catchAll: boolean;
  reason: string;
  confidence: number;
  timestamp: Date;
  userId: string;
}

export interface BulkUpload {
  id: string;
  filename: string;
  totalEmails: number;
  processed: number;
  validCount: number;
  invalidCount: number;
  riskyCount: number;
  unknownCount: number;
  status: "pending" | "processing" | "completed" | "failed";
  uploadedAt: Date;
  userId: string;
  fileUrl?: string;
  emails?: string[];
  results: EmailVerification[];
}

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  signupAdmin: (
    name: string,
    email: string,
    password: string,
    adminCode: string,
  ) => Promise<boolean>;
  login: (
    email: string,
    password: string,
    isAdmin?: boolean,
  ) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  verifyEmail: (email: string) => Promise<EmailVerification>;
  verificationHistory: EmailVerification[];
  bulkUploads: BulkUpload[];
  uploadBulkFile: (
    file: File,
    extractedEmails: string[],
  ) => Promise<BulkUpload>;
  processBulkUpload: (uploadId: string, emails: string[]) => Promise<void>;
  updateBulkStatus: (
    uploadId: string,
    updates: Partial<BulkUpload>,
  ) => Promise<void>;
  allUsers: User[];
  allVerifications: EmailVerification[];
  payments: Payment[];
  pricingPlans: PricingPlan[];
  addPricingPlan: (plan: Omit<PricingPlan, "id">) => Promise<boolean>;
  updatePricingPlan: (
    id: string,
    updates: Partial<PricingPlan>,
  ) => Promise<boolean>;
  deletePricingPlan: (id: string) => Promise<boolean>;
  updateUserProfile: (name: string, email: string) => Promise<boolean>;
  updateUserPassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<boolean>;
  upgradePlan: (
    newPlan: "business" | "enterprise",
    paymentData?: { amount: number; transactionId?: string },
  ) => Promise<boolean>;
  adminUpdateUser: (
    userId: string,
    updates: Partial<Pick<User, "plan" | "role" | "disabled">>,
  ) => Promise<boolean>;
  resetQuota: (userId: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationHistory, setVerificationHistory] = useState<
    EmailVerification[]
  >([]);
  const [bulkUploads, setBulkUploads] = useState<BulkUpload[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allVerifications, setAllVerifications] = useState<EmailVerification[]>(
    [],
  );
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);

  // Listen to pricing plans globally
  useEffect(() => {
    const q = query(collection(db, "plans"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const plansArray: PricingPlan[] = [];
      querySnapshot.forEach((doc) => {
        plansArray.push({ id: doc.id, ...doc.data() } as PricingPlan);
      });
      console.log("Pricing plans updated:", plansArray);
      setPricingPlans(plansArray);
    });
    return () => unsubscribe();
  }, []);

  // Hardcoded API URL - use production on deployed VPS, localhost for dev
  const VALIDATOR_API_URL =
    typeof window !== "undefined" &&
    window.location.hostname === "quickmailfilter.com"
      ? "https://quickmailfilter.com"
      : "http://localhost:3004";
  const QUOTA_LIMITS: Record<string, number> = {
    free: 1000,
    business: 50000,
    enterprise: 1000000,
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          // First, try to get admin document from 'admin' collection
          const adminRef = doc(db, "admin", firebaseUser.uid);
          const adminSnap = await getDoc(adminRef);

          if (adminSnap.exists()) {
            // User is an admin - load from admin collection
            const adminData = adminSnap.data();
            const appUser: User = {
              id: firebaseUser.uid,
              name: adminData.name,
              email: firebaseUser.email || "",
              role: "admin",
              plan: adminData.plan || "enterprise",
              monthlyQuota: adminData.monthlyQuota || QUOTA_LIMITS.enterprise,
              usedQuota: adminData.usedQuota || 0,
              createdAt: adminData.createdAt?.toDate() || new Date(),
              disabled: adminData.disabled || false,
            };
            setUser(appUser);

            // Admin: load all users, all verifications
            await loadAllUsers();
            await loadAllVerifications();
          } else {
            // User is not an admin - try to get from 'users' collection
            const userRef = doc(db, "users", firebaseUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const userData = userSnap.data();
              const appUser: User = {
                id: firebaseUser.uid,
                name: userData.name,
                email: firebaseUser.email || "",
                role: userData.role || "user",
                plan: userData.plan || "free",
                monthlyQuota: userData.monthlyQuota || QUOTA_LIMITS.free,
                usedQuota: userData.usedQuota || 0,
                createdAt: userData.createdAt?.toDate() || new Date(),
                disabled: userData.disabled || false,
              };
              setUser(appUser);

              // Regular user: load personal data
              await loadVerificationHistory(firebaseUser.uid);
              await loadBulkUploads(firebaseUser.uid);
              await loadPayments(firebaseUser.uid);
            }
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          toast.error("Failed to load user data");
        }
      } else {
        setUser(null);
        setVerificationHistory([]);
        setBulkUploads([]);
        setAllUsers([]);
        setAllVerifications([]);
        setPayments([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load verification history from Firestore (per user)
  const loadVerificationHistory = async (userId: string) => {
    try {
      const q = query(
        collection(db, "verifications"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const verifications: EmailVerification[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        verifications.push({
          id: docSnap.id,
          email: data.email,
          status: data.status,
          formatValid: data.formatValid,
          domainExists: data.domainExists,
          mxRecordFound: data.mxRecordFound,
          disposable: data.disposable,
          roleBased: data.roleBased,
          catchAll: data.catchAll,
          reason: data.reason,
          confidence: data.confidence,
          timestamp: data.timestamp?.toDate() || new Date(),
          userId: data.userId,
        });
      });

      setVerificationHistory(verifications);
    } catch (error) {
      console.error("Error loading verification history:", error);
    }
  };

  // Load bulk uploads from Firestore
  const loadBulkUploads = async (userId: string) => {
    try {
      const q = query(
        collection(db, "bulkUploads"),
        where("userId", "==", userId),
        orderBy("uploadedAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const uploads: BulkUpload[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        uploads.push({
          id: docSnap.id,
          filename: data.filename,
          totalEmails: data.totalEmails,
          processed: data.processed,
          validCount: data.validCount,
          invalidCount: data.invalidCount,
          riskyCount: data.riskyCount,
          unknownCount: data.unknownCount,
          status: data.status,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          userId: data.userId,
          fileUrl: data.fileUrl,
          results: data.results || [],
        });
      });

      setBulkUploads(uploads);
    } catch (error) {
      console.error("Error loading bulk uploads:", error);
    }
  };

  // Load user's payment history from Firestore
  const loadPayments = async (userId: string) => {
    try {
      const q = query(
        collection(db, "payments"),
        where("userId", "==", userId),
        orderBy("paymentDate", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const paymentList: Payment[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        paymentList.push({
          id: docSnap.id,
          userId: data.userId,
          plan: data.plan,
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          paymentDate: data.paymentDate?.toDate() || new Date(),
          transactionId: data.transactionId,
        });
      });

      setPayments(paymentList);
    } catch (error) {
      console.error("Error loading payments:", error);
    }
  };

  // Admin: Load all users from Firestore
  const loadAllUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users: User[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        users.push({
          id: docSnap.id,
          name: data.name,
          email: data.email,
          role: data.role || "user",
          plan: data.plan || "free",
          monthlyQuota: data.monthlyQuota || QUOTA_LIMITS.free,
          usedQuota: data.usedQuota || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          disabled: data.disabled || false,
        });
      });

      setAllUsers(users);
    } catch (error) {
      console.error("Error loading all users:", error);
    }
  };

  // Admin: Load all verifications from Firestore
  const loadAllVerifications = async () => {
    try {
      const q = query(
        collection(db, "verifications"),
        orderBy("timestamp", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const verifications: EmailVerification[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        verifications.push({
          id: docSnap.id,
          email: data.email,
          status: data.status,
          formatValid: data.formatValid,
          domainExists: data.domainExists,
          mxRecordFound: data.mxRecordFound,
          disposable: data.disposable,
          roleBased: data.roleBased,
          catchAll: data.catchAll,
          reason: data.reason,
          confidence: data.confidence,
          timestamp: data.timestamp?.toDate() || new Date(),
          userId: data.userId,
        });
      });

      setAllVerifications(verifications);
    } catch (error) {
      console.error("Error loading all verifications:", error);
    }
  };

  // Signup with Firebase Auth
  const signup = async (
    name: string,
    email: string,
    password: string,
  ): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      // Create user document in Firestore
      const userRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userRef, {
        name,
        email,
        role: "user",
        plan: "free",
        monthlyQuota: QUOTA_LIMITS.free,
        usedQuota: 0,
        createdAt: Timestamp.now(),
      });

      toast.success("Account created successfully!");
      return true;
    } catch (error: any) {
      const errorMessage =
        error.code === "auth/email-already-in-use"
          ? "Email already in use"
          : error.message || "Failed to create account";
      toast.error(errorMessage);
      console.error("Signup error:", error);
      return false;
    }
  };

  // Admin Signup with Firebase Auth - creates document in 'admin' collection
  const signupAdmin = async (
    name: string,
    email: string,
    password: string,
    adminCode: string,
  ): Promise<boolean> => {
    try {
      // Verify admin code (server-side validation recommended in production)
      const ADMIN_REGISTRATION_CODE = "ADMIN_SECRET_2026"; // Change this to your secret code

      if (adminCode.trim() !== ADMIN_REGISTRATION_CODE) {
        toast.error("Invalid admin registration code");
        console.error("Invalid admin code attempt");
        return false;
      }

      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      // Create admin document in 'admin' collection (NOT in 'users' collection)
      const adminRef = doc(db, "admin", firebaseUser.uid);
      await setDoc(adminRef, {
        name,
        email,
        plan: "enterprise",
        monthlyQuota: QUOTA_LIMITS.enterprise,
        usedQuota: 0,
        createdAt: Timestamp.now(),
        disabled: false,
        role: "admin",
      });

      toast.success("Admin account created successfully!");
      console.log("New admin created:", firebaseUser.uid);
      return true;
    } catch (error: any) {
      const errorMessage =
        error.code === "auth/email-already-in-use"
          ? "Email already in use"
          : error.message || "Failed to create admin account";
      toast.error(errorMessage);
      console.error("Admin signup error:", error);
      return false;
    }
  };

  // Login with Firebase Auth
  const login = async (
    email: string,
    password: string,
    isAdmin: boolean = false,
  ): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (isAdmin) {
        // Check admin collection for admin account
        const adminRef = doc(db, "admin", userCredential.user.uid);
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {
          await signOut(auth);
          toast.error("Access denied. Admin account not found.");
          return false;
        }

        // Admin account exists and is valid
        console.log("Admin login successful for:", userCredential.user.uid);
      }

      toast.success("Logged in successfully!");
      return true;
    } catch (error: any) {
      const errorMessage =
        error.code === "auth/invalid-credential"
          ? "Invalid email or password"
          : error.message || "Failed to login";
      toast.error(errorMessage);
      console.error("Login error:", error);
      return false;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Create or update user document in Firestore
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email,
          role: "user",
          plan: "free",
          monthlyQuota: QUOTA_LIMITS.free,
          usedQuota: 0,
          createdAt: Timestamp.now(),
        });
      }

      toast.success("Logged in with Google successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to login with Google");
      console.error("Google login error:", error);
      return false;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setVerificationHistory([]);
      setBulkUploads([]);
      setAllUsers([]);
      setAllVerifications([]);
      setPayments([]);
      toast.success("Logged out successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to logout");
      console.error("Logout error:", error);
    }
  };

  // Verify email using backend validator API (public - no auth required)
  const verifyEmail = async (email: string): Promise<EmailVerification> => {
    try {
      // Call the real email validator backend API
      const response = await axios.post(`${VALIDATOR_API_URL}/api/validate`, {
        email: email.toLowerCase().trim(),
      });

      const validatorResult = response.data;

      // Map validator result to our EmailVerification format
      // Use logical defaults to avoid 'undefined' values which Firebase rejects
      const isRisky = ["risky", "suspicious", "compromised"].includes(
        validatorResult.domainStatus,
      );

      const verification: EmailVerification = {
        id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        email,
        status: validatorResult.valid ? "valid" : isRisky ? "risky" : "invalid",
        formatValid: validatorResult.validators?.regex?.valid ?? true,
        domainExists: !!validatorResult.mx_record,
        mxRecordFound: !!validatorResult.mx_record,
        disposable: !!validatorResult.disposable,
        roleBased: !!validatorResult.role,
        catchAll: !!validatorResult.accept_all,
        reason: validatorResult.valid
          ? "All checks passed"
          : validatorResult.reason &&
              validatorResult.validators?.[validatorResult.reason]
            ? `${validatorResult.reason}: ${validatorResult.validators[validatorResult.reason].reason}`
            : "Verification failed",
        confidence: validatorResult.security_score ?? 75,
        timestamp: new Date(),
        userId: user?.id || "guest",
      };

      // Save to Firestore and update quota if user is logged in
      if (user) {
        try {
          const verificationRef = doc(collection(db, "verifications"));
          verification.id = verificationRef.id;
          await setDoc(verificationRef, {
            email: verification.email,
            status: verification.status,
            formatValid: verification.formatValid,
            domainExists: verification.domainExists,
            mxRecordFound: verification.mxRecordFound,
            disposable: verification.disposable,
            roleBased: verification.roleBased,
            catchAll: verification.catchAll,
            reason: verification.reason,
            confidence: verification.confidence,
            timestamp: Timestamp.fromDate(verification.timestamp),
            userId: verification.userId,
          });

          // Increment usedQuota in Firestore atomically
          const userRef = doc(db, "users", user.id);
          await updateDoc(userRef, { usedQuota: increment(1) });

          // Update local user state
          setUser((prev) =>
            prev ? { ...prev, usedQuota: prev.usedQuota + 1 } : prev,
          );
        } catch (saveError) {
          console.error("Error saving verification to Firestore:", saveError);
        }

        setVerificationHistory((prev) => [verification, ...prev]);
      }

      return verification;
    } catch (error: any) {
      console.error("Verification error:", error);
      if (error.response?.status === 429) {
        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error(error.message || "Failed to verify email");
    }
  };

  // Upload bulk file to Firebase Storage (DISABLED - CORS issues)
  const uploadBulkFile = async (
    file: File,
    extractedEmails?: string[],
  ): Promise<BulkUpload> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Firebase Storage is temporarily disabled due to CORS restrictions
    // File will be processed from memory instead

    toast.success("Firebase Storage skipped. Processing emails from memory...");

    try {
      const totalEmails = extractedEmails?.length || 0;

      // Create bulk upload document in Firestore (skipping file upload)
      const bulkDocRef = await addDoc(collection(db, "bulkUploads"), {
        filename: file.name,
        totalEmails,
        processed: 0,
        validCount: 0,
        invalidCount: 0,
        riskyCount: 0,
        unknownCount: 0,
        status: "pending" as const,
        uploadedAt: Timestamp.now(),
        userId: user.id,
        fileUrl: "", // No file URL since Firebase Storage is disabled
        emails: extractedEmails || [],
        results: [],
      });

      const newUpload: BulkUpload = {
        id: bulkDocRef.id,
        filename: file.name,
        totalEmails,
        processed: 0,
        validCount: 0,
        invalidCount: 0,
        riskyCount: 0,
        unknownCount: 0,
        status: "pending",
        uploadedAt: new Date(),
        userId: user.id,
        fileUrl: "", // No file URL
        emails: extractedEmails || [],
        results: [],
      };

      setBulkUploads([newUpload, ...bulkUploads]);
      return newUpload;
    } catch (error) {
      console.error("File upload error:", error);
      throw new Error("Failed to process bulk upload");
    }
  };

  // Process bulk upload
  const processBulkUpload = async (
    uploadId: string,
    emails: string[],
  ): Promise<void> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    const uploadRef = doc(db, "bulkUploads", uploadId);

    try {
      // Update status to processing
      await updateDoc(uploadRef, {
        status: "processing",
        totalEmails: emails.length,
      });

      let validCount = 0;
      let invalidCount = 0;
      let riskyCount = 0;
      let unknownCount = 0;
      const verificationResults: EmailVerification[] = [];

      // Process emails in batches
      for (let i = 0; i < emails.length; i++) {
        const email = emails[i].trim();
        if (!email) continue;

        try {
          const verification = await verifyEmail(email);
          verificationResults.push(verification);

          // Count by status
          if (verification.status === "valid") validCount++;
          else if (verification.status === "invalid") invalidCount++;
          else if (verification.status === "risky") riskyCount++;
          else unknownCount++;

          // Update progress every 10 emails
          if ((i + 1) % 10 === 0) {
            await updateDoc(uploadRef, {
              processed: i + 1,
              validCount,
              invalidCount,
              riskyCount,
              unknownCount,
            });
          }
        } catch (error) {
          console.error(`Error processing email ${email}:`, error);
          unknownCount++;
        }
      }

      // Final update
      await updateDoc(uploadRef, {
        status: "completed",
        processed: emails.length,
        validCount,
        invalidCount,
        riskyCount,
        unknownCount,
        results: verificationResults,
      });

      // Update local state
      setBulkUploads(
        bulkUploads.map((upload) =>
          upload.id === uploadId
            ? {
                ...upload,
                status: "completed",
                processed: emails.length,
                validCount,
                invalidCount,
                riskyCount,
                unknownCount,
                results: verificationResults,
              }
            : upload,
        ),
      );

      toast.success("Bulk verification completed!");
    } catch (error) {
      console.error("Bulk process error:", error);
      await updateDoc(uploadRef, {
        status: "failed",
      });
      throw error;
    }
  };

  const updateBulkStatus = async (
    uploadId: string,
    updates: Partial<BulkUpload>,
  ) => {
    try {
      const uploadRef = doc(db, "bulkUploads", uploadId);
      const firestoreUpdates = { ...updates };
      delete (firestoreUpdates as any).id;

      await updateDoc(uploadRef, firestoreUpdates as any);

      setBulkUploads((prev) =>
        prev.map((u) => (u.id === uploadId ? { ...u, ...updates } : u)),
      );
    } catch (error) {
      console.error("Error updating bulk status:", error);
    }
  };

  // Update user's display name (and optionally email) in Auth + Firestore
  const updateUserProfile = async (
    name: string,
    email: string,
  ): Promise<boolean> => {
    if (!user || !auth.currentUser) return false;
    try {
      // Update Firebase Auth display name
      await updateProfile(auth.currentUser, { displayName: name });

      // Update Firestore user document
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, { name, email });

      setUser((prev) => (prev ? { ...prev, name, email } : prev));
      toast.success("Profile updated successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      console.error("Update profile error:", error);
      return false;
    }
  };

  // Re-authenticate then change password
  const updateUserPassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> => {
    if (!user || !auth.currentUser) return false;
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      toast.success("Password updated successfully!");
      return true;
    } catch (error: any) {
      const msg =
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
          ? "Current password is incorrect"
          : error.message || "Failed to update password";
      toast.error(msg);
      console.error("Update password error:", error);
      return false;
    }
  };

  // Upgrade current user's plan and record payment in Firestore
  const upgradePlan = async (
    newPlan: "business" | "enterprise",
    paymentData?: { amount: number; transactionId?: string },
  ): Promise<boolean> => {
    if (!user) return false;
    const newQuota = QUOTA_LIMITS[newPlan];
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, { plan: newPlan, monthlyQuota: newQuota });

      // Record payment document
      if (paymentData) {
        await addDoc(collection(db, "payments"), {
          userId: user.id,
          plan: newPlan,
          amount: paymentData.amount,
          currency: "INR",
          status: "success",
          paymentDate: Timestamp.now(),
          transactionId: paymentData.transactionId || `txn-${Date.now()}`,
        });
      }

      setUser((prev) =>
        prev ? { ...prev, plan: newPlan, monthlyQuota: newQuota } : prev,
      );
      toast.success(`Plan upgraded to ${newPlan}!`);
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to upgrade plan");
      console.error("Upgrade plan error:", error);
      return false;
    }
  };

  // Admin: update any user's plan, role, or disabled status in Firestore
  const adminUpdateUser = async (
    userId: string,
    updates: Partial<Pick<User, "plan" | "role" | "disabled">>,
  ): Promise<boolean> => {
    try {
      const firestoreUpdates: Record<string, unknown> = { ...updates };
      if (updates.plan) {
        firestoreUpdates.monthlyQuota = QUOTA_LIMITS[updates.plan];
      }
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, firestoreUpdates);

      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                ...updates,
                monthlyQuota: updates.plan
                  ? QUOTA_LIMITS[updates.plan]
                  : u.monthlyQuota,
              }
            : u,
        ),
      );
      toast.success("User updated successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
      console.error("Admin update user error:", error);
      return false;
    }
  };

  // Admin: reset a user's monthly usedQuota to 0
  const resetQuota = async (userId: string): Promise<boolean> => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { usedQuota: 0 });
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, usedQuota: 0 } : u)),
      );
      toast.success("User quota reset successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to reset quota");
      return false;
    }
  };

  const addPricingPlan = async (
    plan: Omit<PricingPlan, "id">,
  ): Promise<boolean> => {
    try {
      await addDoc(collection(db, "plans"), {
        ...plan,
        createdAt: serverTimestamp(),
      });
      toast.success("Pricing plan added successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to add plan");
      return false;
    }
  };

  const updatePricingPlan = async (
    id: string,
    updates: Partial<PricingPlan>,
  ): Promise<boolean> => {
    try {
      const planRef = doc(db, "plans", id);
      const firestoreUpdates = { ...updates };
      delete (firestoreUpdates as any).id;
      await updateDoc(planRef, firestoreUpdates as any);
      toast.success("Pricing plan updated!");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to update plan");
      return false;
    }
  };

  const deletePricingPlan = async (id: string): Promise<boolean> => {
    try {
      const planRef = doc(db, "plans", id);
      await deleteDoc(planRef);
      toast.success("Pricing plan deleted!");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to delete plan");
      return false;
    }
  };

  const value: AppContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    signup,
    signupAdmin,
    login,
    signInWithGoogle,
    logout,
    verifyEmail,
    verificationHistory,
    bulkUploads,
    uploadBulkFile,
    processBulkUpload,
    updateBulkStatus,
    allUsers,
    allVerifications,
    payments,
    pricingPlans,
    addPricingPlan,
    updatePricingPlan,
    deletePricingPlan,
    updateUserProfile,
    updateUserPassword,
    upgradePlan,
    adminUpdateUser,
    resetQuota,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
