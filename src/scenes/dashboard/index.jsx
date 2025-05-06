import { Box, Button, IconButton, Typography, useTheme, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import EmailIcon from "@mui/icons-material/Email";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TrafficIcon from "@mui/icons-material/Traffic";
import CloseIcon from "@mui/icons-material/Close";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import NutritionScoreBarChart from "../../components/NutritionScoreBarChart";
import BarChart from "../../components/BarChart";
import MealDurationChart from "../../components/MealDurationChart";
import MobilityScoreBarChart from "../../components/MobilityScoreBarChart";
import StatBox from "../../components/StatBox";
import MonthlyMealsChart from "../../components/MonthlyMealsChart";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [previewData, setPreviewData] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    if (analysisData?.scoring) {
      console.log("Données de scoring:", analysisData.scoring);
      console.log("Données formatées:", getMobilityScoreData());
    }
  }, [analysisData]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    //Prévisu du csv
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setPreviewData(content.split('\n').slice(0, 6).join('\n'));
      setOpenPreview(true);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    setUploadStatus("Traitement du fichier en cours...");
    setOpenPreview(false);
  
    try {
      const patientNumber = selectedFile.name.match(/_(\d+)\.csv$/)?.[1] || "Inconnu";

      const formData = new FormData();
      formData.append("csvFile", selectedFile);
  
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Erreur lors du traitement");
      }
  
      const result = await response.json();
      console.log("test : ",result);
      
      // Validation des données reçues
      if (!result.analysis_results?.scoring?.formatted) {
        throw new Error("Format de réponse inattendu du serveur");
      }
  
      setAnalysisData({
        patientNumber,
        transitions: result.analysis_results.transitions || [],
        walking_speed: result.analysis_results.walking_speed || [],
        scoring: result.analysis_results.scoring,
        nutrition: result.analysis_results.nutrition,
        meal_durations: result.analysis_results.meal_durations || [],
        monthly_meals: result.analysis_results.monthly_meals || [],
        nutrition_scores: result.analysis_results.nutrition?.raw || [] 
      });

      console.log("Données nutrition:", result.analysis_results.nutrition);
  
      setUploadStatus("Analyse réussie!");
    } catch (error) {
      console.error("Erreur complète:", error);
      setUploadStatus(`Échec: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getDaysCount = () => {
    if (!analysisData?.walking_speed || !Array.isArray(analysisData.walking_speed)) {
      return "N/A";
    }
    const dates = analysisData.walking_speed.map(item => new Date(item.period));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    // Calculer le delta jours
    const diffTime = Math.abs(maxDate - minDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure le premier jour
    
    return diffDays;
  };
  
  const getCurrentMobilityStatus = () => {
    if (!analysisData?.scoring?.raw || !Array.isArray(analysisData.scoring.raw)) {
      return { status: "N/A", color: colors.grey[500] };
    }
    
    const lastRecord = analysisData.scoring.raw[analysisData.scoring.raw.length - 1];
    
    if (!lastRecord) {
      return { status: "N/A", color: colors.grey[500] };
    }
    
    let color;
    switch(lastRecord.Level) {
      case "Danger":
        color = colors.redAccent[500];
        break;
      case "Alerte":
        color = colors.orangeAccent[500];
        break;
      case "Normal":
        color = colors.greenAccent[500];
        break;
      default:
        color = colors.grey[500];
    }
    
    return {
      status: lastRecord.Interpretation || lastRecord.Level || "N/A",
      color
    };
  };

  const getCurrentNutritionStatus = () => {
    if (!analysisData?.nutrition_scores || !Array.isArray(analysisData.nutrition_scores)) {
      return { status: "N/A", color: colors.grey[500] };
    }
    
    // Prendre le dernier enregistrement
    const lastRecord = analysisData.nutrition_scores[analysisData.nutrition_scores.length - 1];
    
    if (!lastRecord) {
      return { status: "N/A", color: colors.grey[500] };
    }
    
    let color;
    switch(lastRecord.classification) {
      case "Danger":
        color = colors.redAccent[500];
        break;
      case "Alerte":
        color = colors.orangeAccent[500];
        break;
      case "Normal":
        color = colors.greenAccent[500];
        break;
      default:
        color = colors.grey[500];
    }
    
    return {
      status: lastRecord.interpretation || lastRecord.classification || "N/A",
      color
    };
  };

  {/*--------FONCTION DE MOBILITEES-----------*/}

  const getMobilityScoreData = () => {
    if (!analysisData?.scoring?.raw || !Array.isArray(analysisData.scoring.raw)) {
      return null;
    }
  
    return {
      keys: ["value"],
      data: analysisData.scoring.raw.map(item => ({
        period: item.period,
        level: item.Level,
        interpretation: item.Interpretation
      }))
    };
  };

  
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
  
  const getBarChartData = () => {
    if (!analysisData?.transitions || !Array.isArray(analysisData.transitions)) {
      return null;
    }
  
    return {
      keys: ["transitions"],
      data: analysisData.transitions
        .filter(item => item.period && item.transitions_count !== undefined)
        .map(item => ({
          period: item.period,
          transitions: Number(item.transitions_count) || 0
        }))
    };
  };


  //----------------------FONCTIONS DE NUTRITIONS-----------------

  const getMealDurationData = () => {
    try {
      if (!analysisData?.meal_durations || !Array.isArray(analysisData.meal_durations)) {
        console.warn("Données de durée des repas manquantes");
        return null;
      }
  
      const validData = analysisData.meal_durations.filter(
        item => item.month && !isNaN(item.avg_duration_minutes)
      );
  
      if (validData.length === 0) {
        console.warn("Aucune donnée valide pour la durée des repas");
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
    } catch (error) {
      console.error("Erreur dans getMealDurationData:", error);
      return null;
    }
  };

  
  const getMonthlyMealsData = () => {
    if (!analysisData?.monthly_meals || !Array.isArray(analysisData.monthly_meals)) {
      return null;
    }
  
    return {
      keys: ["meals"],
      data: analysisData.monthly_meals
        .filter(item => item.month && item.meals_count !== undefined)
        .map(item => ({
          month: item.month,
          meals: Number(item.meals_count) || 0
        }))
    };
  };

  const getNutritionScoreData = () => {
    if (!analysisData?.nutrition_scores || !Array.isArray(analysisData.nutrition_scores)) {
      return null;
    }
  
    return {
      keys: ["value"],
      data: analysisData.nutrition_scores.map(item => ({
        month_start: item.month_start,
        classification: item.classification,
        Snutrition: item.Snutrition,
        interpretation: item.interpretation ,
        color: item.classification === 'Normal' ? tokens(theme.palette.mode).greenAccent[500] :
               item.classification === 'Alerte' ? tokens(theme.palette.mode).orangeAccent[500] :
               tokens(theme.palette.mode).redAccent[500]
      }))
    };
  };
    
//-------------Donnnées de test------------------------------------------



  const handleClosePreview = () => {
    setOpenPreview(false);
    setSelectedFile(null);
    setPreviewData("");
  };
  
  

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="TABLEAU DE BORD" subtitle="bienvenue au tableau de bord" />

        <Box display="flex" gap="10px">
          <Button
            component="label"
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <>
                <UploadFileIcon sx={{ mr: "10px" }} />
                Telecharger dossier patient
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={handleFileChange}
                />
              </>
            )}
          </Button>

          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            Telechager Raport
          </Button>
        </Box>
      </Box>

      {/* FEEDBACK UPLOAD */}
      {uploadStatus && (
        <Box
          mt="10px"
          p="10px"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          backgroundColor={
            uploadStatus.includes("Erreur") 
              ? colors.redAccent[700] 
              : colors.greenAccent[700]
          }
          borderRadius="4px"
        >
          <Typography color={colors.grey[100]}>{uploadStatus}</Typography>
          <IconButton onClick={() => setUploadStatus("")} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* DIALOG PREVIEW */}
      <Dialog open={openPreview} onClose={handleClosePreview} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: colors.primary[400], 
          color: colors.grey[100],
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>Aperçu du fichier CSV</span>
          <IconButton onClick={handleClosePreview}>
            <CloseIcon sx={{ color: colors.grey[100] }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
          backgroundColor: colors.primary[400],
          padding: "20px",
          whiteSpace: "pre-wrap",
          fontFamily: "monospace",
          color: colors.grey[100]
        }}>
          {previewData}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.primary[400] }}>
          <Button 
            onClick={handleClosePreview}
            sx={{ color: colors.grey[100] }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleUpload}
            sx={{ 
              backgroundColor: colors.greenAccent[600],
              color: colors.grey[900],
              "&:hover": {
                backgroundColor: colors.greenAccent[500]
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : "Confirmer l'upload"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="HOMEID CART-FRANCE"
            subtitle=""
            progress=""
            increase={analysisData?.patientNumber || "N/A"}
            icon={
              <PersonAddIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="Jours de suivi disponibles"
            subtitle=""
            progress=""
            increase={getDaysCount()}
            icon={
              <PointOfSaleIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="Statut de Mobilité Actuel"
            subtitle=""
            progress=""
            increase={getCurrentMobilityStatus().status}
            icon={
              <TrafficIcon
                sx={{ color: getCurrentMobilityStatus().color,
                   fontSize: "26px" }}
              />
            }
            textColor={getCurrentMobilityStatus().color}
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="Statut Nutritionnel Actuel"
            subtitle=""
            progress=""
            increase={getCurrentNutritionStatus().status}
            icon={
              <TrafficIcon
                sx={{ color: getCurrentNutritionStatus().color}}
              />
            }
            textColor={getCurrentNutritionStatus().color}
          />
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Vitesse de marche mensuelle
              </Typography>
              <Typography
                variant="h4"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                (m/s)
              </Typography>
            </Box>
{/*            <Box>
              <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                />
              </IconButton>
            </Box>*/}
          </Box>
          <Box height="250px" m="-20px 0 0 0">
          {getLineChartData() ? (
      <LineChart isDashboard={true} data={getLineChartData()} />
    ) : (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography variant="h6" color={colors.grey[300]}>
          Aucune donnée de vitesse à afficher
        </Typography>
    </Box>
  )}
          </Box>
        </Box>
        <Box
  gridColumn="span 4"
  gridRow="span 2"
  backgroundColor={colors.primary[400]}
>
    <Typography
      variant="h5"
      fontWeight="600"
      sx={{ padding: "30px 30px 0 30px" }}
    >
      Moyenne de transitions par mois
    </Typography>
    <Box height="250px" mt="-20px">
      {getBarChartData() ? (
        <BarChart isDashboard={true} data={getBarChartData()} />
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="h6" color={colors.grey[300]}>
            Aucune donnée de transitions
          </Typography>
        </Box>
      )}
    </Box>
  </Box>

  <Box
  gridColumn="span 4"
  gridRow="span 2"
  backgroundColor={colors.primary[400]}
  p="30px"
>
  <Typography
    variant="h5"
    fontWeight="600"
    sx={{ padding: "0 0 20px 0" }}
  >
    Évaluation de la Mobilité
  </Typography>
  <Box height="250px" mt="-20px">
    {getMobilityScoreData() ? (
      <MobilityScoreBarChart isDashboard={true} data={getMobilityScoreData()} />
    ) : (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography variant="h6" color={colors.grey[300]}>
          Aucune donnée disponible
        </Typography>
      </Box>
    )}
  </Box>
</Box>
        {/* Exemple de composant à scroll bar on ne sait jamais
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Recent Transactions
            </Typography>
          </Box>
          {mockTransactions.map((transaction, i) => (
            <Box
              key={`${transaction.txId}-${i}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box>
                <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {transaction.txId}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {transaction.user}
                </Typography>
              </Box>
              <Box color={colors.grey[100]}>{transaction.date}</Box>
              <Box
                backgroundColor={colors.greenAccent[500]}
                p="5px 10px"
                borderRadius="4px"
              >
                ${transaction.cost}
              </Box>
            </Box>
          ))}
        </Box>*/}

        {/* ROW 3 */}
        <Box
  gridColumn="span 4"
  gridRow="span 2"
  backgroundColor={colors.primary[400]}
>
  <Box
    mt="25px"
    p="0 30px"
    display="flex"
    justifyContent="space-between"
    alignItems="center"
  >
    <Box>
      <Typography
        variant="h5"
        fontWeight="600"
        color={colors.grey[100]}
      >
        Durée moyenne mensuelle des repas
      </Typography>
      <Typography
                variant="h5"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                (min)
              </Typography>
    </Box>
  </Box>
  <Box height="250px" m="-20px 0 0 0">
    {getMealDurationData() ? (
      <MealDurationChart isDashboard={true} data={getMealDurationData()} />
    ) : (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography variant="h6" color={colors.grey[300]}>
          Aucune donnée nutritionnelle
        </Typography>
      </Box>
    )}
  </Box>
</Box>
<Box
  gridColumn="span 4"
  gridRow="span 2"
  backgroundColor={colors.primary[400]}
>
  <Typography
    variant="h5"
    fontWeight="600"
    sx={{ padding: "30px 30px 0 30px" }}
  >
    Moyenne de repas par mois
  </Typography>
  <Box height="250px" mt="-20px">
    {getMonthlyMealsData() ? (
      <MonthlyMealsChart isDashboard={true} data={getMonthlyMealsData()} />
    ) : (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography variant="h6" color={colors.grey[300]}>
          Aucune donnée de repas disponible
        </Typography>
      </Box>
    )}
  </Box>
</Box>
<Box
  gridColumn="span 4"
  gridRow="span 2"
  backgroundColor={colors.primary[400]}
  p="30px"
>
  <Typography
    variant="h5"
    fontWeight="600"
    sx={{ padding: "0 0 20px 0" }}
  >
    Évolution du Statut Nutritionnel
  </Typography>
  <Box height="250px" mt="-20px">
    {getNutritionScoreData() ? (
      <NutritionScoreBarChart isDashboard={true} data={getNutritionScoreData()} />
    ) : (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography variant="h6" color={colors.grey[300]}>
          Aucune donnée disponible
        </Typography>
      </Box>
    )}
  </Box>
</Box>
      </Box>
    </Box>
  );
};

export default Dashboard;