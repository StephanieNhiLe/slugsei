import csv
import os

class PlayerData:
    def __init__(self, filePath):
        self.filePath = filePath
        self.players_data = self._load_data()

    def _load_data(self):
        players_data = {}
        with open(self.filePath, mode='r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                player_id = row['play_id']
                players_data[player_id] = {
                    'title': row['title'],
                    'ExitVelocity': row['ExitVelocity'],
                    'HitDistance': row['HitDistance'],
                    'LaunchAngle': row['LaunchAngle'],
                    'video': row['video']
                }
        return players_data

    def get_player_data(self, player_id):
        return self.players_data.get(player_id, None)

    def get_all_players(self):
        return self.players_data

if __name__ == "__main__":
    filePath = os.path.join(os.path.dirname(__file__), '../../datasets/2024-mlb-homeruns.csv')
    player_service = PlayerData(filePath)
    player_data = player_service.get_player_data('148e943b-10db-4d71-943d-ead3b36bebbc')
    print(player_data)
