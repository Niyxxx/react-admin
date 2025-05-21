import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import MealDurationChart from "../../components/MealDurationChart";
import { useState, useEffect } from "react";

const Line = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [analysisData, setAnalysisData] = useState(null);
  
  useEffect(() => {
    // récupération du session storage les données depuis le sessionStorage
    const savedData = sessionStorage.getItem('analysisData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setAnalysisData(parsedData);
      } catch (error) {
        console.error("Erreur lors de la lecture des données sauvegardées:", error);
      }
    }
  }, []);

  // même fonction que sur la scèene principale pour obtenir les données du LineChart
  const getLineChartData = () => {
    if (!analysisData?.walking_speed || !Array.isArray(analysisData.walking_speed)) {
      return null;
    }
  
    return [{
      id: "Vitesse",
      color: colors.greenAccent[500],
      data: analysisData.walking_speed.map(item => ({
        x: item.period,
        y: item.walking_speed_m_s || 0
      }))
    }];
  };

  // Fonction pour obtenir les données du MealDurationChart
  const getMealDurationData = () => {
    if (!analysisData?.meal_durations || !Array.isArray(analysisData.meal_durations)) {
      return null;
    }

    const validData = analysisData.meal_durations.filter(
      item => item.month && !isNaN(item.avg_duration_minutes)
    );

    if (validData.length === 0) {
      return null;
    }

    return [{
      id: "Durée Moy",
      color: colors.blueAccent[500],
      data: validData.map(item => ({
        x: item.month,
        y: Number(item.avg_duration_minutes.toFixed(2))
      }))
    }];
  };

  return (
    <Box m="20px">
      <Header title="Graphiques Linéaires" subtitle="Visualisation des courbes" />
      
      {!analysisData ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
          <Typography variant="h4" color={colors.grey[300]}>
            Aucune donnée disponible. Veuillez d'abord téléverser un fichier CSV dans le tableau de bord.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Section pour le LineChart (Vitesse de marche) */}
          <Box mb="40px">
            <Typography variant="h4" fontWeight="600" color={colors.grey[100]} mb="15px">
              Vitesse de marche moyenne mensuelle
            </Typography>
            <Typography variant="h6" color={colors.blueAccent[500]} mb="20px">
              en mètres par seconde (m/s)
            </Typography>
            <Box height="500px">
              {getLineChartData() ? (
                <LineChart isDashboard={false} data={getLineChartData()} />
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography variant="h6" color={colors.grey[300]}>
                    Aucune donnée de vitesse à afficher
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          
          {/* Section pour le MealDurationChart */}
          <Box>
            <Typography variant="h4" fontWeight="600" color={colors.grey[100]} mb="15px">
              Durée moyenne mensuelle des repas
            </Typography>
            <Typography variant="h6" color={colors.blueAccent[500]} mb="20px">
              en minutes
            </Typography>
            <Box height="500px">
              {getMealDurationData() ? (
                <MealDurationChart isDashboard={false} data={getMealDurationData()} />
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography variant="h6" color={colors.grey[300]}>
                    Aucune donnée de durée des repas disponible
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Line;