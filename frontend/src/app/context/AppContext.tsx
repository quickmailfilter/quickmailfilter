import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
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
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../config/firebaseConfig';
import axios from 'axios';
import { toast } from 'sonner';

export type UserRole = 'user' | 'admin';

export type EmailStatus = 'valid' | 'invalid' | 'risky' | 'unknown';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: 'free' | 'business' | 'enterprise';
  monthlyQuota: number;
  usedQuota: number;
  createdAt: Date;
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
  status: 'pending' | 'processing' | 'completed' | 'failed';
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
  login: (email: string, password: string, isAdmin?: boolean) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  verifyEmail: (email: string) => Promise<EmailVerification>;
  verificationHistory: EmailVerification[];
  bulkUploads: BulkUpload[];
  uploadBulkFile: (file: File, extractedEmails: string[]) => Promise<BulkUpload>;
  processBulkUpload: (uploadId: string, emails: string[]) => Promise<void>;
  updateBulkStatus: (uploadId: string, updates: Partial<BulkUpload>) => Promise<void>;
  allUsers: User[];
  allVerifications: EmailVerification[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationHistory, setVerificationHistory] = useState<EmailVerification[]>([]);
  const [bulkUploads, setBulkUploads] = useState<BulkUpload[]>([]);
  const [allUsers] = useState<User[]>([]);
  const [allVerifications] = useState<EmailVerification[]>([]);

  const VALIDATOR_API_URL = import.meta.env.VITE_VALIDATOR_API_URL || 'http://localhost:3004';
  const QUOTA_LIMITS = {
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
          // Get user document from Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            const appUser: User = {
              id: firebaseUser.uid,
              name: userData.name,
              email: firebaseUser.email || '',
              role: userData.role || 'user',
              plan: userData.plan || 'free',
              monthlyQuota: userData.monthlyQuota || QUOTA_LIMITS.free,
              usedQuota: userData.usedQuota || 0,
              createdAt: userData.createdAt?.toDate() || new Date(),
            };
            setUser(appUser);

            // Load verification history
            await loadVerificationHistory(firebaseUser.uid);
            // Load bulk uploads
            await loadBulkUploads(firebaseUser.uid);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          toast.error('Failed to load user data');
        }
      } else {
        setUser(null);
        setVerificationHistory([]);
        setBulkUploads([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load verification history from Firestore
  const loadVerificationHistory = async (userId: string) => {
    try {
      const q = query(
        collection(db, 'verifications'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const verifications: EmailVerification[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        verifications.push({
          id: doc.id,
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

      // Sort by timestamp, newest first
      verifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setVerificationHistory(verifications);
    } catch (error) {
      console.error('Error loading verification history:', error);
    }
  };

  // Load bulk uploads from Firestore
  const loadBulkUploads = async (userId: string) => {
    try {
      const q = query(
        collection(db, 'bulkUploads'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const uploads: BulkUpload[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        uploads.push({
          id: doc.id,
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

      // Sort by upload date, newest first
      uploads.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
      setBulkUploads(uploads);
    } catch (error) {
      console.error('Error loading bulk uploads:', error);
    }
  };

  // Signup with Firebase Auth
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create user document in Firestore
      const userRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userRef, {
        name,
        email,
        role: 'user',
        plan: 'free',
        monthlyQuota: QUOTA_LIMITS.free,
        usedQuota: 0,
        createdAt: Timestamp.now(),
      });

      toast.success('Account created successfully!');
      return true;
    } catch (error: any) {
      const errorMessage = error.code === 'auth/email-already-in-use'
        ? 'Email already in use'
        : error.message || 'Failed to create account';
      toast.error(errorMessage);
      console.error('Signup error:', error);
      return false;
    }
  };

  // Login with Firebase Auth
  const login = async (email: string, password: string, isAdmin: boolean = false): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (isAdmin) {
        const userRef = doc(db, 'users', userCredential.user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.role !== 'admin') {
            await signOut(auth);
            toast.error('Access denied. Admin role required.');
            return false;
          }
        } else {
          await signOut(auth);
          toast.error('User record not found.');
          return false;
        }
      }

      toast.success('Logged in successfully!');
      return true;
    } catch (error: any) {
      const errorMessage = error.code === 'auth/invalid-credential'
        ? 'Invalid email or password'
        : error.message || 'Failed to login';
      toast.error(errorMessage);
      console.error('Login error:', error);
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
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email,
          role: 'user',
          plan: 'free',
          monthlyQuota: QUOTA_LIMITS.free,
          usedQuota: 0,
          createdAt: Timestamp.now(),
        });
      }

      toast.success('Logged in with Google successfully!');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to login with Google');
      console.error('Google login error:', error);
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
      toast.success('Logged out successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout');
      console.error('Logout error:', error);
    }
  };

  // Verify email using backend validator API
  const verifyEmail = async (email: string): Promise<EmailVerification> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (user.usedQuota >= user.monthlyQuota) {
      throw new Error('Monthly quota exceeded');
    }

    try {
      // Call the real email validator backend API
      const response = await axios.post(`${VALIDATOR_API_URL}/api/validate`, {
        email: email.toLowerCase().trim(),
      });

      const validatorResult = response.data;

      // Map validator result to our EmailVerification format
      // Use logical defaults to avoid 'undefined' values which Firebase rejects
      const isRisky = ['risky', 'suspicious', 'compromised'].includes(validatorResult.domainStatus);
      
      const verification: EmailVerification = {
        id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        email,
        status: validatorResult.valid ? 'valid' : (isRisky ? 'risky' : 'invalid'),
        formatValid: validatorResult.validators?.regex?.valid ?? true,
        domainExists: !!validatorResult.mx_record,
        mxRecordFound: !!validatorResult.mx_record,
        disposable: !!validatorResult.disposable,
        roleBased: !!validatorResult.role,
        catchAll: !!validatorResult.accept_all,
        reason: validatorResult.valid 
          ? 'All checks passed' 
          : (validatorResult.reason && validatorResult.validators?.[validatorResult.reason]
              ? `${validatorResult.reason}: ${validatorResult.validators[validatorResult.reason].reason}`
              : 'Verification failed'),
        confidence: validatorResult.security_score ?? 75,
        timestamp: new Date(),
        userId: user.id,
      };

      // Save to Firestore
      await addDoc(collection(db, 'verifications'), {
        ...verification,
        timestamp: Timestamp.now(),
      });

      // Update user's used quota
      const userRef = doc(db, 'users', user.id);
      const newUsedQuota = user.usedQuota + 1;
      await updateDoc(userRef, {
        usedQuota: newUsedQuota,
      });

      // Update local state
      setUser({ ...user, usedQuota: newUsedQuota });
      setVerificationHistory([verification, ...verificationHistory]);

      return verification;
    } catch (error: any) {
      console.error('Verification error:', error);
      if (error.response?.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }
      throw new Error(error.message || 'Failed to verify email');
    }
  };

  // Upload bulk file to Firebase Storage
  const uploadBulkFile = async (file: File, extractedEmails?: string[]): Promise<BulkUpload> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    let fileUrl = '';
    try {
      // Upload file to Firebase Storage
      const storageRef = ref(
        storage,
        `bulk-uploads/${user.id}/${Date.now()}-${file.name}`
      );
      await uploadBytes(storageRef, file);
      fileUrl = await getDownloadURL(storageRef);
    } catch (error: any) {
      console.error('Firebase Storage Error (CORS or permissions):', error);
      // If it's a CORS error, we'll still proceed since we have the emails parsed
      // This allows the user to continue while they fix their Firebase CORS settings
      toast.warning('Storage upload blocked by CORS. Processing from memory instead.');
      console.warn('Proceeding without raw file storage. Check Firebase Storage CORS settings.');
    }

    try {
      const totalEmails = extractedEmails?.length || 0;

      // Create bulk upload document in Firestore
      const bulkDocRef = await addDoc(collection(db, 'bulkUploads'), {
        filename: file.name,
        totalEmails,
        processed: 0,
        validCount: 0,
        invalidCount: 0,
        riskyCount: 0,
        unknownCount: 0,
        status: 'pending' as const,
        uploadedAt: Timestamp.now(),
        userId: user.id,
        fileUrl,
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
        status: 'pending',
        uploadedAt: new Date(),
        userId: user.id,
        fileUrl,
        emails: extractedEmails || [],
        results: [],
      };

      setBulkUploads([newUpload, ...bulkUploads]);
      return newUpload;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file');
    }
  };

  // Process bulk upload
  const processBulkUpload = async (uploadId: string, emails: string[]): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const uploadRef = doc(db, 'bulkUploads', uploadId);

    try {
      // Update status to processing
      await updateDoc(uploadRef, {
        status: 'processing',
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
          if (verification.status === 'valid') validCount++;
          else if (verification.status === 'invalid') invalidCount++;
          else if (verification.status === 'risky') riskyCount++;
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
        status: 'completed',
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
                status: 'completed',
                processed: emails.length,
                validCount,
                invalidCount,
                riskyCount,
                unknownCount,
                results: verificationResults,
              }
            : upload
        )
      );

      toast.success('Bulk verification completed!');
    } catch (error) {
      console.error('Bulk process error:', error);
      await updateDoc(uploadRef, {
        status: 'failed',
      });
      throw error;
    }
  };

  const updateBulkStatus = async (uploadId: string, updates: Partial<BulkUpload>) => {
    try {
      const uploadRef = doc(db, 'bulkUploads', uploadId);
      const firestoreUpdates = { ...updates };
      delete (firestoreUpdates as any).id;
      
      await updateDoc(uploadRef, firestoreUpdates as any);
      
      setBulkUploads(prev => prev.map(u => u.id === uploadId ? { ...u, ...updates } : u));
    } catch (error) {
      console.error('Error updating bulk status:', error);
    }
  };

  const value: AppContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    signup,
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
