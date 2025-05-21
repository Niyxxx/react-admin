import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import BarChart from "../../components/BarChart";
import MonthlyMealsChart from "../../components/MonthlyMealsChart";
import { useState, useEffect } from "react";

const Bar = () => {
  const theme = useTheme();
  const [analysisData, setAnalysisData] = useState(null);
  
  useEffect(() => {
    // Récupérer les données depuis le sessionStorage
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

  // Fonction pour obtenir les données du BarChart
  const getBarChartData = () => {
    if (!analysisData?.transitions || !Array.isArray(analysisData.transitions)) {
      return null;
    }

    return {
      keys: ["transitions"],
      data: analysisData.transitions
        .filter(item => item.period && item.daily_avg_transitions !== undefined)
        .map(item => ({
          period: item.period,
          transitions: Number(item.daily_avg_transitions.toFixed(2)) || 0
        }))
    };
  };

  // Fonction pour obtenir les données du MonthlyMealsChart
  const getMonthlyMealsData = () => {
    if (!analysisData?.monthly_meals || !Array.isArray(analysisData.monthly_meals)) {
      return null;
    }

    return {
      keys: ["meals"],
      data: analysisData.monthly_meals
        .filter(item => item.month && item.daily_avg_meals !== undefined)
        .map(item => ({
          month: item.month,
          meals: Number(item.daily_avg_meals.toFixed(2)) || 0
        }))
    };
  };

  return (
    <Box m="20px">
      <Header title="Graphiques détaillés" subtitle="Visualisation des données de transitions et repas" />
      
      {/* Section pour le BarChart */}
      <Box mb="40px">
        <Typography variant="h4" fontWeight="600" color={tokens(theme.palette.mode).grey[100]} mb="15px">
          Nombre moyen de transitions mensuel
        </Typography>
        <Box height="500px">
          <BarChart isDashboard={false} data={getBarChartData()} />
        </Box>
      </Box>
      
      {/* Section pour le MonthlyMealsChart */}
      <Box>
        <Typography variant="h4" fontWeight="600" color={tokens(theme.palette.mode).grey[100]} mb="15px">
          Nombre moyen de repas par jour pour chaque mois
        </Typography>
        <Box height="500px">
          <MonthlyMealsChart isDashboard={false} data={getMonthlyMealsData()} />
        </Box>
      </Box>
    </Box>
  );
};

export default Bar;