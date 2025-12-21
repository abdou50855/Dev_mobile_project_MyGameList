import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const GameItem = ({ game, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    const colors = {
      'backlog': '#FF6B6B',
      'playing': '#4ECDC4',
      'completed': '#1DD1A1',
      'dropped': '#8395A7'
    };
    return colors[status] || '#6C63FF';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'backlog': 'À jouer',
      'playing': 'En cours',
      'completed': 'Terminé',
      'dropped': 'Abandonné'
    };
    return labels[status] || status;
  };

  return (
    <View style={styles.container}>
      <View style={styles.gameInfo}>
        <Text style={styles.title} numberOfLines={1}>{game.title}</Text>
        <View style={styles.details}>
          <View style={[styles.badge, { backgroundColor: '#6C63FF' }]}>
            <Text style={styles.badgeText}>{game.platform}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getStatusColor(game.status) }]}>
            <Text style={styles.badgeText}>{getStatusLabel(game.status)}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={() => onEdit(game)}>
          <Text style={styles.buttonText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(game.id)}>
          <Text style={styles.buttonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2d43',
  },
  gameInfo: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#4ECDC4',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
});

export default GameItem;