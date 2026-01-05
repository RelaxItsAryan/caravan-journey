import { SaveData } from './types';

const SAVE_KEY = 'caravans_leaderboard';
const MAX_ENTRIES = 10;

export class SaveManager {
  static saveScore(playerName: string, distance: number, money: number): void {
    const leaderboard = this.getLeaderboard();
    
    const newEntry: SaveData = {
      playerName,
      distance: Math.floor(distance),
      money,
      date: new Date().toISOString()
    };
    
    leaderboard.push(newEntry);
    leaderboard.sort((a, b) => b.distance - a.distance);
    
    const trimmed = leaderboard.slice(0, MAX_ENTRIES);
    
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Failed to save score:', e);
    }
  }
  
  static getLeaderboard(): SaveData[] {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to load leaderboard:', e);
      return [];
    }
  }
  
  static isHighScore(distance: number): boolean {
    const leaderboard = this.getLeaderboard();
    if (leaderboard.length < MAX_ENTRIES) return true;
    return distance > leaderboard[leaderboard.length - 1].distance;
  }
  
  static clearLeaderboard(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      console.warn('Failed to clear leaderboard:', e);
    }
  }
}
