import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  const translateFirebaseError = (code) => {
    const map = {
      'auth/invalid-email': 'Adresse email invalide',
      'auth/user-not-found': 'Ce compte n’existe pas',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/email-already-in-use': 'Cet email est déjà utilisé',
      'auth/weak-password': 'Mot de passe trop faible',
    };
    return map[code] || 'Une erreur est survenue';
  };

  const switchMode = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsLogin((prev) => !prev);
      setEmail('');
      setPassword('');
      setErrorMsg('');
      setSuccessMsg('');

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const showError = (msg) => {
    setErrorMsg(msg);
    setSuccessMsg('');

    setTimeout(() => setErrorMsg(''), 4000);
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setErrorMsg('');

    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSubmit = async () => {
    if (!email || !password)
      return showError('Veuillez remplir tous les champs');

    if (!validateEmail(email))
      return showError('Veuillez saisir un email valide');

    if (!isLogin && password.length < 6)
      return showError('Le mot de passe doit faire au moins 6 caractères');

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        showSuccess('Connexion réussie 🎉');
        setTimeout(() => navigation.navigate('Home'), 1200);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        showSuccess('Compte créé avec succès 🎉 Vous pouvez vous connecter.');
        setTimeout(() => switchMode(), 1500);
      }
    } catch (error) {
      showError(translateFirebaseError(error.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.logo}>🎮</Text>
        <Text style={styles.appName}>MyGameList</Text>
      </View>

      <View style={styles.card}>
        
        {/* ALERTES */}
        {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}
        {successMsg ? <Text style={styles.successMsg}>{successMsg}</Text> : null}

        <Text style={styles.title}>
          {isLogin ? 'Connexion' : 'Inscription'}
        </Text>
        <Text style={styles.subtitle}>
          {isLogin
            ? 'Connectez-vous pour accéder à votre collection'
            : 'Créez votre compte pour commencer'}
        </Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6C63FF" />
              <Text style={styles.loadingText}>
                {isLogin ? 'Connexion...' : 'Création du compte...'}
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                {isLogin ? 'Se connecter' : 'S’inscrire'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.switchContainer}
          onPress={switchMode}
          disabled={loading}
        >
          <Text style={styles.switchText}>
            {isLogin ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
            <Text style={styles.switchLink}>
              {isLogin ? 'S’inscrire' : 'Se connecter'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Gérez votre collection de jeux vidéo
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    padding: 20,
  },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 60, marginBottom: 10 },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#6C63FF' },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 30,
    elevation: 10,
  },
  errorMsg: {
    backgroundColor: '#ff4f4f',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  successMsg: {
    backgroundColor: '#32d27f',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 30 },
  form: { marginBottom: 20 },
  input: {
    backgroundColor: '#0f3460',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    fontSize: 16,
    borderColor: '#6C63FF',
  },
  loadingContainer: { alignItems: 'center', padding: 20 },
  loadingText: { color: '#6C63FF', marginTop: 15, fontSize: 16 },
  submitButton: {
    backgroundColor: '#6C63FF',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  switchContainer: {
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2a2d43',
  },
  switchText: { color: '#aaa', fontSize: 16 },
  switchLink: { color: '#6C63FF', fontWeight: 'bold' },
  footer: { marginTop: 30, alignItems: 'center' },
  footerText: { color: '#666', fontSize: 14 },
});

export default AuthScreen;
