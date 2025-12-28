// Types globaux de l'application

export type User = {
  id: string;
  email: string;
  displayName?: string;
  role: 'doctor' | 'admin';
  createdAt: Date;
};

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};
