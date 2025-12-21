import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { auth } from '../services/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { PieChart } from 'react-native-chart-kit';

const StatsScreen = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    byPlatform: {},
    byStatus: {},
    completionRate: 0
  });

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
      calculateStats(gamesList);
    } catch (error) {
      console.error('Erreur de chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (gamesList) => {
    const byPlatform = {};
    const byStatus = {};
    
    gamesList.forEach(game => {
      // Par plateforme
      byPlatform[game.platform] = (byPlatform[game.platform] || 0) + 1;
      
      // Par statut
      byStatus[game.status] = (byStatus[game.status] || 0) + 1;
    });

    const completed = byStatus['completed'] || 0;
    const completionRate = gamesList.length > 0 
      ? Math.round((completed / gamesList.length) * 100) 
      : 0;

    setStats({
      total: gamesList.length,
      byPlatform,
      byStatus,
      completionRate
    });
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

  const getStatusColor = (status) => {
    const colors = {
      'backlog': '#FF6B6B',
      'playing': '#4ECDC4',
      'completed': '#1DD1A1',
      'dropped': '#8395A7'
    };
    return colors[status] || '#6C63FF';
  };

  const preparePieData = (data, isStatus = false) => {
    return Object.entries(data).map(([key, value]) => ({
      name: isStatus ? getStatusLabel(key) : key,
      population: value,
      color: isStatus ? getStatusColor(key) : getRandomColor(key),
      legendFontColor: '#fff',
      legendFontSize: 12
    }));
  };

  const getRandomColor = (seed) => {
    const colors = [
      '#6C63FF', '#FF6584', '#4ECDC4', '#FFC145', 
      '#9B5DE5', '#00BBF9', '#F15BB5', '#00F5D4'
    ];
    const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📈 Statistiques</Text>
        <Text style={styles.subtitle}>Analyse de votre collection</Text>
      </View>

      {/* Statistiques principales */}
      <View style={styles.mainStats}>
        <View style={styles.mainStatCard}>
          <Text style={styles.mainStatNumber}>{stats.total}</Text>
          <Text style={styles.mainStatLabel}>Jeux au total</Text>
        </View>
        
        <View style={styles.mainStatCard}>
          <Text style={styles.mainStatNumber}>{stats.completionRate}%</Text>
          <Text style={styles.mainStatLabel}>Taux de complétion</Text>
        </View>
      </View>

      {/* Graphique par statut */}
      {stats.total > 0 && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Répartition par statut</Text>
            <View style={styles.chartContainer}>
              <PieChart
                data={preparePieData(stats.byStatus, true)}
                width={screenWidth - 60}
                height={200}
                chartConfig={{
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          </View>

          {/* Graphique par plateforme */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎮 Répartition par plateforme</Text>
            <View style={styles.chartContainer}>
              <PieChart
                data={preparePieData(stats.byPlatform)}
                width={screenWidth - 60}
                height={200}
                chartConfig={{
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          </View>

          {/* Détails par plateforme */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Détails par plateforme</Text>
            <View style={styles.detailsContainer}>
              {Object.entries(stats.byPlatform).map(([platform, count]) => (
                <View key={platform} style={styles.detailRow}>
                  <Text style={styles.detailPlatform}>{platform}</Text>
                  <View style={styles.detailBarContainer}>
                    <View 
                      style={[
                        styles.detailBar, 
                        { 
                          width: `${(count / stats.total) * 100}%`,
                          backgroundColor: getRandomColor(platform)
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.detailCount}>{count}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Détails par statut */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Détails par statut</Text>
            <View style={styles.statusDetails}>
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <View key={status} style={styles.statusItem}>
                  <View style={styles.statusInfo}>
                    <View 
                      style={[
                        styles.statusDot, 
                        { backgroundColor: getStatusColor(status) }
                      ]} 
                    />
                    <Text style={styles.statusLabel}>{getStatusLabel(status)}</Text>
                  </View>
                  <Text style={styles.statusCount}>{count}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      {stats.total === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune statistique disponible</Text>
          <Text style={styles.emptySubtext}>
            Ajoutez des jeux pour voir vos statistiques
          </Text>
        </View>
      )}
    </ScrollView>
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
    fontSize: 16,
  },
  header: {
    padding: 25,
    backgroundColor: '#16213e',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
  },
  mainStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  mainStatCard: {
    backgroundColor: '#0f3460',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  mainStatNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 5,
  },
  mainStatLabel: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },
  detailsContainer: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailPlatform: {
    color: '#fff',
    width: 100,
    fontSize: 14,
    fontWeight: '600',
  },
  detailBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#2a2d43',
    borderRadius: 4,
    marginHorizontal: 15,
    overflow: 'hidden',
  },
  detailBar: {
    height: '100%',
    borderRadius: 4,
  },
  detailCount: {
    color: '#6C63FF',
    fontWeight: 'bold',
    width: 30,
    textAlign: 'right',
  },
  statusDetails: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusLabel: {
    color: '#fff',
    fontSize: 16,
  },
  statusCount: {
    color: '#6C63FF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default StatsScreen;