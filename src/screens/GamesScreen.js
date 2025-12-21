import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { auth } from '../services/firebaseConfig';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const GamesScreen = ({ navigation }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  
  // Formulaire
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('PS5');
  const [status, setStatus] = useState('backlog');
  const [search, setSearch] = useState('');

  const platforms = ['PS5', 'Xbox Series X', 'Nintendo Switch', 'PC', 'Mobile'];
  const statuses = [
    { value: 'backlog', label: 'À jouer', color: '#FF6B6B' },
    { value: 'playing', label: 'En cours', color: '#4ECDC4' },
    { value: 'completed', label: 'Terminé', color: '#1DD1A1' },
    { value: 'dropped', label: 'Abandonné', color: '#8395A7' }
  ];

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const gamesQuery = query(
        collection(db, 'games'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(gamesQuery);
      const gamesList = [];
      
      querySnapshot.forEach((doc) => {
        gamesList.push({ id: doc.id, ...doc.data() });
      });

      setGames(gamesList);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les jeux');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGame = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Erreur', 'Vous devez être connecté');
        return;
      }

      const gameData = {
        title: title.trim(),
        platform,
        status,
        userId: user.uid,
        createdAt: new Date()
      };

      if (editingGame) {
        // Mettre à jour
        await updateDoc(doc(db, 'games', editingGame.id), gameData);
        Alert.alert('Succès', 'Jeu mis à jour');
      } else {
        // Ajouter
        await addDoc(collection(db, 'games'), gameData);
        Alert.alert('Succès', 'Jeu ajouté');
      }

      resetForm();
      loadGames();
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleDeleteGame = async (gameId) => {
    Alert.alert(
      'Confirmer',
      'Supprimer ce jeu ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'games', gameId));
              loadGames();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer');
            }
          }
        }
      ]
    );
  };

  const handleEditGame = (game) => {
    setEditingGame(game);
    setTitle(game.title);
    setPlatform(game.platform);
    setStatus(game.status);
    setModalVisible(true);
  };

  const resetForm = () => {
    setTitle('');
    setPlatform('PS5');
    setStatus('backlog');
    setEditingGame(null);
  };

  const filteredGames = games.filter(game =>
    game.title.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (statusValue) => {
    const statusObj = statuses.find(s => s.value === statusValue);
    return statusObj ? statusObj.color : '#8395A7';
  };

  const getStatusLabel = (statusValue) => {
    const statusObj = statuses.find(s => s.value === statusValue);
    return statusObj ? statusObj.label : 'Inconnu';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎮 Ma Collection</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un jeu..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Liste des jeux */}
      {filteredGames.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun jeu dans votre collection</Text>
          <Text style={styles.emptySubtext}>Cliquez sur "+ Ajouter" pour commencer</Text>
        </View>
      ) : (
        <FlatList
          data={filteredGames}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.gameCard}>
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle}>{item.title}</Text>
                <View style={styles.gameDetails}>
                  <View style={[styles.platformBadge, { backgroundColor: '#6C63FF' }]}>
                    <Text style={styles.badgeText}>{item.platform}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.badgeText}>{getStatusLabel(item.status)}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.gameActions}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => handleEditGame(item)}
                >
                  <Text style={styles.editButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteGame(item.id)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal pour ajouter/modifier */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingGame ? 'Modifier le jeu' : 'Ajouter un jeu'}
              </Text>

              <Text style={styles.label}>Titre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: The Legend of Zelda"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.label}>Plateforme</Text>
              <View style={styles.platformContainer}>
                {platforms.map((plat) => (
                  <TouchableOpacity
                    key={plat}
                    style={[
                      styles.platformOption,
                      platform === plat && styles.platformSelected
                    ]}
                    onPress={() => setPlatform(plat)}
                  >
                    <Text style={[
                      styles.platformText,
                      platform === plat && styles.platformTextSelected
                    ]}>
                      {plat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Statut</Text>
              <View style={styles.statusContainer}>
                {statuses.map((stat) => (
                  <TouchableOpacity
                    key={stat.value}
                    style={[
                      styles.statusOption,
                      { backgroundColor: stat.color + '20' },
                      status === stat.value && { backgroundColor: stat.color }
                    ]}
                    onPress={() => setStatus(stat.value)}
                  >
                    <Text style={[
                      styles.statusText,
                      status === stat.value && styles.statusTextSelected
                    ]}>
                      {stat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleAddGame}
                >
                  <Text style={styles.saveButtonText}>
                    {editingGame ? 'Mettre à jour' : 'Ajouter'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    color: '#fff',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#16213e',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchInput: {
    backgroundColor: '#0f3460',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
  },
  listContainer: {
    padding: 20,
  },
  gameCard: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2d43',
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  gameDetails: {
    flexDirection: 'row',
    gap: 10,
  },
  platformBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  gameActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#4ECDC4',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 18,
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 25,
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#0f3460',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  platformContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  platformOption: {
    backgroundColor: '#0f3460',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2a2d43',
  },
  platformSelected: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  platformText: {
    color: '#aaa',
  },
  platformTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 25,
  },
  statusOption: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
  },
  statusTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#ff4757',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#6C63FF',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GamesScreen;