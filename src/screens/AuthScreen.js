import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  Animated
} from 'react-native';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(1))[0];

  const switchMode = () => {
    // Animation de fondu
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsLogin(!isLogin);
      setEmail('');
      setPassword('');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Succès', 'Connexion réussie ! 🎉');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit faire au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Succès', 'Compte créé avec succès ! ✅\nVous pouvez maintenant vous connecter.');
      
      // Animation et retour au login
      setTimeout(() => {
        switchMode(); // Retour au login avec animation
        setLoading(false);
      }, 2000);
      
    } catch (error) {
      Alert.alert('Erreur', error.message);
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* En-tête avec logo et titre */}
      <View style={styles.header}>
        <Text style={styles.logo}>🎮</Text>
        <Text style={styles.appName}>MyGameList</Text>
      </View>

      {/* Carte d'authentification */}
      <View style={styles.card}>
        {/* Titre qui change selon le mode */}
        <Text style={styles.title}>
          {isLogin ? 'Connexion' : 'Inscription'}
        </Text>
        <Text style={styles.subtitle}>
          {isLogin 
            ? 'Connectez-vous pour accéder à votre collection' 
            : 'Créez votre compte pour commencer'}
        </Text>

        {/* Formulaire */}
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
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6C63FF" />
              <Text style={styles.loadingText}>
                {isLogin ? 'Connexion en cours...' : 'Création du compte...'}
              </Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {isLogin ? 'Se connecter' : 'S\'inscrire'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Lien pour switcher */}
        <TouchableOpacity 
          style={styles.switchContainer} 
          onPress={switchMode}
          disabled={loading}
        >
          <Text style={styles.switchText}>
            {isLogin 
              ? 'Pas encore de compte ? ' 
              : 'Déjà un compte ? '}
            <Text style={styles.switchLink}>
              {isLogin ? 'S\'inscrire' : 'Se connecter'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#0f3460',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#6C63FF',
    marginTop: 15,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#6C63FF',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchContainer: {
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2a2d43',
  },
  switchText: {
    color: '#aaa',
    fontSize: 16,
  },
  switchLink: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
});

export default AuthScreen;