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
  sendPasswordResetEmail,
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

export type EmailStatus =
  | "valid"
  | "catch-all"
  | "invalid"
  | "risky"
  | "unknown";

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
  dailyCredits?: number; // Daily allowance for subscription plans
  dailyUsedQuota?: number; // Credits used today
  lastDailyReset?: Date; // Last time daily quota was reset
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
  catchAllCount: number;
  invalidCount: number;
  riskyCount: number;
  unknownCount: number;
  status: "pending" | "processing" | "completed" | "failed";
  uploadedAt: Date;
  userId: string;
  fileUrl?: string;
  emails?: string[];
  results: EmailVerification[];
  quotaLimited?: boolean;
}

export interface UserReport {
  id: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedUserEmail: string;
  reportedBy: string; // admin id
  reportedByName: string;
  reason: string;
  description: string;
  status: "open" | "closed" | "investigating";
  severity: "low" | "medium" | "high";
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
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
  allReports: UserReport[];
  createUserReport: (
    reportedUserId: string,
    reason: string,
    description: string,
    severity: "low" | "medium" | "high",
  ) => Promise<boolean>;
  updateReportStatus: (
    reportId: string,
    status: "open" | "closed" | "investigating",
    resolution?: string,
  ) => Promise<boolean>;
  sendPasswordResetEmail: (
    email: string,
  ) => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

/**
 * Normalize EmailVerification data loaded from Firestore
 * This applies validator correction for consistency across single and bulk verifications
 * Handles both old (pre-fix) and new (post-fix) data formats
 */
const normalizeEmailVerificationFromFirestore = (
  data: any,
): EmailVerification => {
  // If the data already has correct validators, use it as-is
  // Otherwise, reconstruct based on what we know
  return {
    id: data.id || "",
    email: data.email,
    status: data.status as EmailStatus,
    formatValid: data.formatValid ?? true,
    domainExists: data.domainExists ?? false,
    mxRecordFound: data.mxRecordFound ?? false,
    disposable: data.disposable ?? false,
    roleBased: data.roleBased ?? false,
    catchAll: data.catchAll ?? false,
    reason: data.reason || "Verification result",
    confidence: data.confidence ?? 0,
    timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
    userId: data.userId || "guest",
  };
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
  const [allReports, setAllReports] = useState<UserReport[]>([]);

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

  // Listen to user reports
  useEffect(() => {
    const q = query(
      collection(db, "userReports"),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reportsArray: UserReport[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reportsArray.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          resolvedAt: data.resolvedAt?.toDate(),
        } as UserReport);
      });
      setAllReports(reportsArray);
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
    free: 50,
    business: 50000,
    enterprise: 1000000,
  };

  // Helper function to disconnect and clear all user data
  const disconnect = () => {
    setUser(null);
    setVerificationHistory([]);
    setBulkUploads([]);
    setAllUsers([]);
    setAllVerifications([]);
    setPayments([]);
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      try {
        setLoading(true);

        if (firebaseUser) {
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
              dailyCredits: adminData.dailyCredits || 0,
              dailyUsedQuota: adminData.dailyUsedQuota || 0,
              lastDailyReset: adminData.lastDailyReset?.toDate() || new Date(),
              createdAt: adminData.createdAt?.toDate() || new Date(),
              disabled: adminData.disabled || false,
            };

            // Check if admin account is disabled
            if (appUser.disabled) {
              await signOut(auth);
              if (isMounted) {
                disconnect();
                toast.error("Your admin account has been disabled.");
              }
              return;
            }

            if (isMounted) setUser(appUser);

            // Admin: load all users, all verifications
            if (isMounted) {
              await loadAllUsers();
              await loadAllVerifications();
            }
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
                dailyCredits: userData.dailyCredits || 0,
                dailyUsedQuota: userData.dailyUsedQuota || 0,
                lastDailyReset: userData.lastDailyReset?.toDate() || new Date(),
                createdAt: userData.createdAt?.toDate() || new Date(),
                disabled: userData.disabled || false,
              };

              // Check if user account is disabled
              if (appUser.disabled) {
                await signOut(auth);
                if (isMounted) {
                  disconnect();
                  toast.error(
                    "Your account has been disabled. Please contact support.",
                  );
                }
                return;
              }

              if (isMounted) setUser(appUser);

              // Regular user: load personal data
              if (isMounted) {
                await loadVerificationHistory(firebaseUser.uid);
                await loadBulkUploads(firebaseUser.uid);
                await loadPayments(firebaseUser.uid);
              }
            } else {
              // No user document found - create a default one
              console.warn("User document not found, creating default user");
              const newUserRef = doc(db, "users", firebaseUser.uid);
              await setDoc(newUserRef, {
                name: firebaseUser.displayName || "User",
                email: firebaseUser.email,
                role: "user",
                plan: "free",
                monthlyQuota: QUOTA_LIMITS.free,
                usedQuota: 0,
                dailyCredits: 0,
                dailyUsedQuota: 0,
                lastDailyReset: new Date(),
                createdAt: new Date(),
                disabled: false,
              });

              const appUser: User = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || "User",
                email: firebaseUser.email || "",
                role: "user",
                plan: "free",
                monthlyQuota: QUOTA_LIMITS.free,
                usedQuota: 0,
                dailyCredits: 0,
                dailyUsedQuota: 0,
                lastDailyReset: new Date(),
                createdAt: new Date(),
                disabled: false,
              };

              if (isMounted) setUser(appUser);
            }
          }
        } else {
          // User logged out
          if (isMounted) disconnect();
        }
      } catch (error) {
        console.error("Error in auth state change handler:", error);
        if (isMounted) {
          disconnect();
          toast.error("An error occurred. Please log in again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Set up real-time listener for current user to sync plan and quota changes
  useEffect(() => {
    if (!user?.id) return;

    let unsubscribe: (() => void) | null = null;

    const setupUserListener = async () => {
      try {
        // Determine which collection to listen to based on user role
        const collectionName = user.role === "admin" ? "admin" : "users";
        const userRef = doc(db, collectionName, user.id);

        unsubscribe = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser((prevUser) => {
              if (!prevUser) return prevUser;

              return {
                ...prevUser,
                name: userData.name || prevUser.name,
                email: userData.email || prevUser.email,
                plan: userData.plan || prevUser.plan,
                monthlyQuota: userData.monthlyQuota ?? prevUser.monthlyQuota,
                usedQuota: userData.usedQuota ?? prevUser.usedQuota,
                dailyCredits: userData.dailyCredits ?? prevUser.dailyCredits,
                dailyUsedQuota:
                  userData.dailyUsedQuota ?? prevUser.dailyUsedQuota,
                lastDailyReset:
                  userData.lastDailyReset?.toDate() || prevUser.lastDailyReset,
                disabled: userData.disabled ?? prevUser.disabled,
              };
            });
          }
        });
      } catch (error) {
        console.error("Error setting up user listener:", error);
      }
    };

    setupUserListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.id, user?.role]);

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
        const normalized = normalizeEmailVerificationFromFirestore({
          id: docSnap.id,
          ...data,
        });
        verifications.push(normalized);
      });

      setVerificationHistory(verifications);
    } catch (error: any) {
      // Check if it's an index error
      if (error.message?.includes("requires an index")) {
        console.warn(
          "Firestore index not created for verifications. Please see FIRESTORE_INDEXES_SETUP.md",
        );
      } else {
        console.error("Error loading verification history:", error);
      }
      // Set empty array to allow app to continue
      setVerificationHistory([]);
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

        // Normalize the results array to ensure consistent validator mapping
        const normalizedResults = (data.results || []).map((result: any) =>
          normalizeEmailVerificationFromFirestore({
            id: result.id || "",
            ...result,
          }),
        );

        uploads.push({
          id: docSnap.id,
          filename: data.filename,
          totalEmails: data.totalEmails,
          processed: data.processed,
          validCount: data.validCount,
          catchAllCount: data.catchAllCount || 0,
          invalidCount: data.invalidCount,
          riskyCount: data.riskyCount,
          unknownCount: data.unknownCount,
          status: data.status,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          userId: data.userId,
          fileUrl: data.fileUrl,
          results: normalizedResults,
        });
      });

      setBulkUploads(uploads);
    } catch (error: any) {
      if (error.message?.includes("requires an index")) {
        console.warn(
          "Firestore index not created for bulkUploads. Please see FIRESTORE_INDEXES_SETUP.md",
        );
      } else {
        console.error("Error loading bulk uploads:", error);
      }
      setBulkUploads([]);
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
    } catch (error: any) {
      if (error.message?.includes("requires an index")) {
        console.warn(
          "Firestore index not created for payments. Please see FIRESTORE_INDEXES_SETUP.md",
        );
      } else {
        console.error("Error loading payments:", error);
      }
      setPayments([]);
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
          dailyCredits: data.dailyCredits || 0,
          dailyUsedQuota: data.dailyUsedQuota || 0,
          lastDailyReset: data.lastDailyReset?.toDate() || new Date(),
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
        const normalized = normalizeEmailVerificationFromFirestore({
          id: docSnap.id,
          ...data,
        });
        verifications.push(normalized);
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
        dailyCredits: 0,
        dailyUsedQuota: 0,
        lastDailyReset: Timestamp.now(),
        createdAt: Timestamp.now(),
        disabled: false,
      });

      toast.success("Account created successfully!");
      return true;
    } catch (error: any) {
      const errorMessage =
        error.code === "auth/email-already-in-use"
          ? "Email already in use"
          : error.code === "auth/weak-password"
            ? "Password must be at least 6 characters"
            : error.code === "auth/invalid-email"
              ? "Invalid email address"
              : error.message || "Failed to create account";
      console.error("Signup error:", error.code, error.message);
      toast.error(errorMessage);
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
        dailyCredits: 0,
        dailyUsedQuota: 0,
        lastDailyReset: Timestamp.now(),
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
          disconnect();
          toast.error("Access denied. Admin account not found.");
          return false;
        }

        // Check if admin is disabled
        const adminData = adminSnap.data();
        if (adminData?.disabled) {
          await signOut(auth);
          disconnect();
          toast.error("Your admin account has been disabled.");
          return false;
        }

        console.log("Admin login successful for:", userCredential.user.uid);
      } else {
        // Check regular user account
        const userRef = doc(db, "users", userCredential.user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData?.disabled) {
            await signOut(auth);
            disconnect();
            toast.error(
              "Your account has been disabled. Please contact support.",
            );
            return false;
          }
        }
      }

      toast.success("Logged in successfully!");
      return true;
    } catch (error: any) {
      const errorMessage =
        error.code === "auth/invalid-credential"
          ? "Invalid email or password"
          : error.code === "auth/user-not-found"
            ? "User not found"
            : error.code === "auth/wrong-password"
              ? "Incorrect password"
              : error.code === "auth/too-many-requests"
                ? "Too many login attempts. Please try again later."
                : error.message || "Failed to login";

      console.error("Login error:", error.code, error.message);
      toast.error(errorMessage);
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
          dailyCredits: 0,
          dailyUsedQuota: 0,
          lastDailyReset: Timestamp.now(),
          createdAt: Timestamp.now(),
          disabled: false,
        });
      }

      toast.success("Logged in with Google successfully!");
      return true;
    } catch (error: any) {
      // Silently handle popup closed by user - this is normal user behavior
      if (error.code === "auth/popup-closed-by-user") {
        console.debug("Google login popup closed by user");
        return false;
      }

      // Handle account exists with different credentials
      if (error.code === "auth/account-exists-with-different-credential") {
        toast.error(
          "This email is already registered with a different login method",
        );
        return false;
      }

      // Handle network errors
      if (error.code === "auth/network-request-failed") {
        toast.error("Network error. Please check your connection");
        return false;
      }

      // Handle other errors
      toast.error(error.message || "Failed to login with Google");
      console.error("Google login error:", error);
      return false;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      disconnect();
      toast.success("Logged out successfully!");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Failed to logout");
      // Still disconnect even if signOut fails
      disconnect();
    }
  };

  // Verify email using backend validator API (public - no auth required)
  const verifyEmail = async (email: string): Promise<EmailVerification> => {
    try {
      // Check daily limits if user has subscription plan with daily credits
      if (user && user.dailyCredits && user.dailyCredits > 0) {
        if ((user.dailyUsedQuota || 0) >= user.dailyCredits) {
          throw new Error(
            `Daily limit reached! You have used ${user.dailyUsedQuota || 0}/${user.dailyCredits} credits today. Limit resets at midnight UTC.`,
          );
        }
      }

      // Call the real email validator backend API with userId for daily limit check
      const response = await axios.post(`${VALIDATOR_API_URL}/api/validate`, {
        email: email.toLowerCase().trim(),
        userId: user?.id, // Backend will verify daily limits
      });

      const validatorResult = response.data;

      // Map validator result to our EmailVerification format
      // Use logical defaults to avoid 'undefined' values which Firebase rejects
      const securityScore = validatorResult.security_score ?? 75;
      const isExplicitlyRisky = ["risky", "suspicious", "compromised"].includes(
        validatorResult.domainStatus,
      );
      // Classify: risky = low confidence (<70), catch-all = accept-all domain
      const isRisky =
        isExplicitlyRisky || (validatorResult.valid && securityScore < 70);
      const isCatchAll =
        validatorResult.valid &&
        !isRisky &&
        validatorResult.accept_all === true;

      const emailStatus: EmailStatus = !validatorResult.valid
        ? isExplicitlyRisky
          ? "risky"
          : "invalid"
        : isRisky
          ? "risky"
          : isCatchAll
            ? "catch-all"
            : "valid";

      const emailReason = !validatorResult.valid
        ? validatorResult.reason &&
          validatorResult.validators?.[validatorResult.reason]
          ? `${validatorResult.reason}: ${validatorResult.validators[validatorResult.reason].reason}`
          : "Verification failed"
        : isRisky
          ? `Low confidence (${securityScore}%): limited domain signals`
          : isCatchAll
            ? "Accept-all domain: mailbox existence unverifiable"
            : "All checks passed";

      const verification: EmailVerification = {
        id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        email,
        status: emailStatus,
        // Use validators object for accurate representation of what passed/failed
        formatValid: validatorResult.validators?.regex?.valid ?? true,
        domainExists:
          validatorResult.validators?.smtp?.valid ??
          validatorResult.smtpVerified ??
          false,
        mxRecordFound: validatorResult.validators?.mx?.valid ?? false,
        disposable:
          validatorResult.disposable ||
          !validatorResult.validators?.disposable?.valid,
        roleBased: !!validatorResult.role, // Role detection isn't a validator, just a flag
        catchAll:
          validatorResult.validators?.smtp?.valid === false
            ? false // If SMTP failed, it's not a catch-all
            : !!validatorResult.accept_all, // Otherwise, use the actual accept_all flag
        reason: emailReason,
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

          // Increment usedQuota and dailyUsedQuota in Firestore atomically
          const userRef = doc(db, "users", user.id);
          await updateDoc(userRef, {
            usedQuota: increment(1),
            dailyUsedQuota: increment(1),
          });

          // Update local user state
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  usedQuota: prev.usedQuota + 1,
                  dailyUsedQuota: (prev.dailyUsedQuota || 0) + 1,
                }
              : prev,
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

      // Check quota upfront
      const remainingQuota = Math.max(0, user.monthlyQuota - user.usedQuota);
      if (remainingQuota === 0) {
        toast.info(
          "Your monthly quota is fully used. Please wait for the next month or upgrade your plan.",
        );
      } else if (totalEmails > remainingQuota) {
        toast.info(
          `You have ${remainingQuota} emails remaining in your quota. Only ${remainingQuota} of ${totalEmails} emails will be processed.`,
        );
      }

      // Create bulk upload document in Firestore (skipping file upload)
      const bulkDocRef = await addDoc(collection(db, "bulkUploads"), {
        filename: file.name,
        totalEmails,
        processed: 0,
        validCount: 0,
        catchAllCount: 0,
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
        catchAllCount: 0,
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
      // Calculate remaining quota
      const remainingQuota = Math.max(0, user.monthlyQuota - user.usedQuota);
      const emailsToProcess = Math.min(emails.length, remainingQuota);

      // Show warning if user is exceeding their quota
      if (emails.length > remainingQuota) {
        if (remainingQuota === 0) {
          toast.warning(
            `Your monthly quota is fully used. Please wait for the next month or upgrade your plan.`,
          );
        } else {
          toast.warning(
            `Your plan allows only ${remainingQuota} emails/month. Processing first ${emailsToProcess} emails of ${emails.length} uploaded.`,
          );
        }
      }

      // Update status to processing
      await updateDoc(uploadRef, {
        status: "processing",
        totalEmails: emails.length,
        quotaLimited: emailsToProcess < emails.length,
      });

      let validCount = 0;
      let catchAllCount = 0;
      let invalidCount = 0;
      let riskyCount = 0;
      let unknownCount = 0;
      const verificationResults: EmailVerification[] = [];

      // Process emails in batches (limited by quota)
      for (let i = 0; i < emailsToProcess; i++) {
        const email = emails[i].trim();
        if (!email) continue;

        try {
          const verification = await verifyEmail(email);
          verificationResults.push(verification);

          // Count by status
          if (verification.status === "valid") validCount++;
          else if (verification.status === "catch-all") catchAllCount++;
          else if (verification.status === "invalid") invalidCount++;
          else if (verification.status === "risky") riskyCount++;
          else unknownCount++;

          // Update progress every 10 emails
          if ((i + 1) % 10 === 0) {
            await updateDoc(uploadRef, {
              processed: i + 1,
              validCount,
              catchAllCount,
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
        processed: emailsToProcess,
        validCount,
        catchAllCount,
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
                processed: emailsToProcess,
                validCount,
                catchAllCount,
                invalidCount,
                riskyCount,
                unknownCount,
                results: verificationResults,
              }
            : upload,
        ),
      );

      if (emailsToProcess === 0) {
        toast.error("No emails could be processed due to quota limit.");
      } else if (emailsToProcess < emails.length) {
        toast.success(
          `Bulk verification completed! Processed ${emailsToProcess} of ${emails.length} emails.`,
        );
      } else {
        toast.success("Bulk verification completed!");
      }
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
    newPlan: string,
    paymentData?: { amount: number; transactionId?: string },
  ): Promise<boolean> => {
    if (!user) return false;

    // Normalize plan name to lowercase
    const normalizedPlan = newPlan.toString().toLowerCase().trim();

    // Find the plan in pricingPlans to get its actual quota
    const planConfig = pricingPlans.find(
      (p) => p.name.toLowerCase().trim() === normalizedPlan,
    );

    if (!planConfig) {
      console.error(
        `Plan not found: ${newPlan}. Available plans:`,
        pricingPlans.map((p) => p.name),
      );
      toast.error(`Plan not found: ${newPlan}`);
      return false;
    }

    const newQuota = planConfig.quota;
    const dailyCredits = planConfig.dailyCredits || 0;

    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        plan: normalizedPlan,
        monthlyQuota: newQuota,
        dailyCredits,
        dailyUsedQuota: 0, // Reset daily used quota on plan upgrade
        lastDailyReset: Timestamp.now(),
      });

      // Record payment document
      if (paymentData) {
        await addDoc(collection(db, "payments"), {
          userId: user.id,
          plan: normalizedPlan,
          amount: paymentData.amount,
          currency: "INR",
          status: "success",
          paymentDate: Timestamp.now(),
          transactionId: paymentData.transactionId || `txn-${Date.now()}`,
        });
      }

      setUser((prev) =>
        prev
          ? {
              ...prev,
              plan: normalizedPlan,
              monthlyQuota: newQuota,
              dailyCredits,
              dailyUsedQuota: 0,
              lastDailyReset: new Date(),
            }
          : prev,
      );
      toast.success(`Plan upgraded to ${normalizedPlan}!`);
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
        // Find the plan in pricingPlans to get its quota and daily credits
        const normalizedPlan = updates.plan.toLowerCase().trim();

        if (normalizedPlan === "free") {
          // Handle free plan
          firestoreUpdates.monthlyQuota = QUOTA_LIMITS["free"] || 50;
          firestoreUpdates.dailyCredits = 0;
          firestoreUpdates.usedQuota = 0;
          firestoreUpdates.dailyUsedQuota = 0;
          firestoreUpdates.lastDailyReset = Timestamp.now();
        } else {
          const planConfig = pricingPlans.find(
            (p) => p.name.toLowerCase().trim() === normalizedPlan,
          );

          if (planConfig) {
            firestoreUpdates.monthlyQuota = planConfig.quota;
            firestoreUpdates.dailyCredits = planConfig.dailyCredits || 0;
            firestoreUpdates.dailyUsedQuota = 0; // Reset daily usage
            firestoreUpdates.lastDailyReset = Timestamp.now();
          } else {
            console.warn(
              `Plan not found in pricing plans: ${updates.plan}. Using existing quota.`,
            );
          }
        }
      }
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, firestoreUpdates);

      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            const newData = { ...u, ...updates };
            if (updates.plan) {
              const normalizedPlan = updates.plan.toLowerCase().trim();
              if (normalizedPlan === "free") {
                newData.monthlyQuota = QUOTA_LIMITS["free"] || 50;
                newData.dailyCredits = 0;
                newData.usedQuota = 0;
                newData.dailyUsedQuota = 0;
                newData.lastDailyReset = new Date();
              } else {
                const planConfig = pricingPlans.find(
                  (p) => p.name.toLowerCase().trim() === normalizedPlan,
                );
                if (planConfig) {
                  newData.monthlyQuota = planConfig.quota;
                  newData.dailyCredits = planConfig.dailyCredits || 0;
                  newData.dailyUsedQuota = 0;
                  newData.lastDailyReset = new Date();
                }
              }
            }
            return newData;
          }
          return u;
        }),
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

  const createUserReport = async (
    reportedUserId: string,
    reason: string,
    description: string,
    severity: "low" | "medium" | "high",
  ): Promise<boolean> => {
    try {
      if (!user) {
        toast.error("You must be logged in to create a report");
        return false;
      }

      const reportedUser = allUsers.find((u) => u.id === reportedUserId);
      if (!reportedUser) {
        toast.error("User not found");
        return false;
      }

      await addDoc(collection(db, "userReports"), {
        reportedUserId,
        reportedUserName: reportedUser.name,
        reportedUserEmail: reportedUser.email,
        reportedBy: user.id,
        reportedByName: user.name,
        reason,
        description,
        severity,
        status: "open",
        createdAt: serverTimestamp(),
      });

      toast.success("Report created successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to create report");
      return false;
    }
  };

  const updateReportStatus = async (
    reportId: string,
    status: "open" | "closed" | "investigating",
    resolution?: string,
  ): Promise<boolean> => {
    try {
      const reportRef = doc(db, "userReports", reportId);
      const updateData: Partial<UserReport> = { status };
      if (resolution) {
        updateData.resolution = resolution;
        updateData.resolvedAt = new Date();
      }

      await updateDoc(reportRef, updateData);

      toast.success("Report status updated successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to update report status");
      return false;
    }
  };

  const sendPasswordResetEmailHandler = async (
    email: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: "Please enter a valid email address",
        };
      }

      // Send password reset email with custom URL
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: false,
      });

      console.log(`Password reset email sent to ${email}`);
      return {
        success: true,
        message: "Password reset email sent successfully!",
      };
    } catch (error: any) {
      let errorMsg = "Failed to send password reset email";

      switch (error.code) {
        case "auth/user-not-found":
          errorMsg =
            "No account found with this email address. Please check and try again.";
          break;
        case "auth/invalid-email":
          errorMsg = "Invalid email address format";
          break;
        case "auth/too-many-requests":
          errorMsg =
            "Too many reset requests. Please try again later or contact support.";
          break;
        case "auth/operation-not-allowed":
          errorMsg = "Password reset is not enabled. Please contact support.";
          break;
        default:
          if (error.message) {
            errorMsg = error.message;
          }
      }

      console.error("Password reset error:", error);
      return {
        success: false,
        message: errorMsg,
      };
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
    allReports,
    createUserReport,
    updateReportStatus,
    sendPasswordResetEmail: sendPasswordResetEmailHandler,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
