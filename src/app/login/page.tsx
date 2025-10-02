'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useAuth, useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Music, Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Data for families and their registration codes.
// In a real production app, this would likely come from a database.
const families = [
    { id: 'Familie-Butz-Braun', name: 'Familie Butz/Braun', code: 'Rolf1784' },
    { id: 'Familie-Froehle', name: 'Familie Fröhle', code: 'Froehle2024' },
    { id: 'Familie-Weiss', name: 'Familie Weiß', code: 'Weiss2024' },
];

export default function LoginPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const { firestore } = useFirebase();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Fehler beim Anmelden',
        description: 'E-Mail oder Passwort ist falsch.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedFamily = families.find(f => f.id === selectedFamilyId);

    if (!selectedFamily) {
        toast({
            title: 'Keine Familie ausgewählt',
            description: 'Bitte wähle eine Familie aus der Liste aus.',
            variant: 'destructive',
        });
        return;
    }

    if (registrationCode !== selectedFamily.code) {
        toast({
            title: 'Falscher Registrierungscode',
            description: 'Der eingegebene Code ist für die ausgewählte Familie nicht korrekt.',
            variant: 'destructive',
        });
        return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      const user = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(user, { displayName: registerName });
      
      // Create user document in Firestore
      if (firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, {
            id: user.uid,
            name: registerName,
            email: registerEmail,
            familyName: selectedFamily.id
        });
      }
      
      router.push('/');
    } catch (error: any) {
      let description = 'Ein unbekannter Fehler ist aufgetreten.';
      if (error.code === 'auth/email-already-in-use') {
          description = 'Diese E-Mail-Adresse wird bereits verwendet.';
      } else if (error.code === 'auth/weak-password') {
          description = 'Das Passwort ist zu schwach. Es muss mindestens 6 Zeichen lang sein.';
      }
      toast({
        title: 'Fehler bei der Registrierung',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
       <div className="absolute top-8 left-8 flex items-center gap-2">
          <Music className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold">Vierklang</h1>
        </div>
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Anmelden</TabsTrigger>
          <TabsTrigger value="register">Registrieren</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Anmelden</CardTitle>
              <CardDescription>Melde dich bei deinem Familienkonto an.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-Mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="deine@email.de"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Passwort</Label>
                  <Input
                    id="login-password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Anmelden
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Registrieren</CardTitle>
              <CardDescription>Tritt einer Familie bei. Du benötigst dazu den Familien-Code.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="register-name">Voller Name</Label>
                  <Input
                    id="register-name"
                    placeholder="Max Mustermann"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">E-Mail</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="deine@email.de"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Passwort</Label>
                  <Input
                    id="register-password"
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-family">Familie</Label>
                    <Select value={selectedFamilyId} onValueChange={setSelectedFamilyId} disabled={isLoading}>
                        <SelectTrigger id="register-family">
                            <SelectValue placeholder="Wähle deine Familie" />
                        </SelectTrigger>
                        <SelectContent>
                            {families.map(family => (
                                <SelectItem key={family.id} value={family.id}>{family.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-code">Registrierungscode</Label>
                  <Input
                    id="register-code"
                    type="text"
                    placeholder="Familien-Code"
                    required
                    value={registrationCode}
                    onChange={(e) => setRegistrationCode(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Konto erstellen
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    

    