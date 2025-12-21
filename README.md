# 🎮 MyGameList - Gestion de Collection de Jeux Vidéo

## 📱 Application React Native

Application mobile permettant de gérer sa collection personnelle de jeux vidéo, avec suivi des statuts et statistiques.

## 🚀 Fonctionnalités

- ✅ **Authentification** (Email/Mot de passe avec Firebase)
- ✅ **CRUD complet** des jeux (Ajouter, Voir, Modifier, Supprimer)
- ✅ **Gestion des statuts** (À jouer, En cours, Terminé, Abandonné)
- ✅ **Statistiques** avec graphiques interactifs
- ✅ **Recherche** et filtres
- ✅ **Interface moderne** et responsive

## 🏗️ Architecture
MyGameList/
├── src/
│ ├── screens/
│ │ ├── AuthScreen.js # Connexion/Inscription
│ │ ├── HomeScreen.js # Dashboard
│ │ ├── GamesScreen.js # Gestion des jeux (CRUD)
│ │ └── StatsScreen.js # Statistiques
│ ├── components/
│ │ └── GameItem.js # Composant jeu réutilisable
│ ├── services/
│ │ └── firebaseConfig.js # Configuration Firebase
│ └── navigation/
│ └── AppNavigator.js # Navigation
├── App.js # Point d'entrée
└── README.md


## 🔧 Technologies

- **React Native** + **Expo**
- **Firebase** (Authentication + Firestore)
- **React Navigation** (Stack Navigator)
- **React Native Chart Kit** (Graphiques)

