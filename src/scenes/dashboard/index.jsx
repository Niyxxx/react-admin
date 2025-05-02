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
import GeographyChart from "../../components/GeographyChart";
import BarChart from "../../components/BarChart";
import MealDurationChart from "../../components/MealDurationChart";
import GlobalScoringBarChart from "../../components/GlobalScoringBarChart";
import StatBox from "../../components/StatBox";
import ProgressCircle from "../../components/ProgressCircle";
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
      console.log("Données formatées:", getScoringData());
    }
  }, [analysisData]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    // Lire le fichier pour prévisualisation
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
      
      // Validation des données reçues
      if (!result.analysis_results?.scoring?.formatted) {
        throw new Error("Format de réponse inattendu du serveur");
      }
  
      setAnalysisData({
        transitions: result.analysis_results.transitions || [],
        walking_speed: result.analysis_results.walking_speed || [],
        scoring: result.analysis_results.scoring,
        nutrition: result.analysis_results.nutrition,
        meal_durations: result.analysis_results.meal_durations || []
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
  
  const getScoringData = () => {
    if (!analysisData?.scoring?.raw) return null;
  
    return {
      chart_data: analysisData.scoring.raw.map(item => ({
        period: item.period,
        // Utilisez le score cumulé des transitions OU de la vitesse
        score: (Number(item.cumulative_score_transitions) || 0) + 
        (Number(item.cumulative_score_speed) || 0),
        level: item.Level || 'Inconnu',
        interpretation: item.Interpretation || '',
        color: item.Level === "Danger" ? colors.redAccent[500] : 
               item.Level === "Alerte" ? colors.orangeAccent[500] : 
               colors.greenAccent[500]
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
        id: "Durée moyenne des repas",
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
  
    
//-------------Donnnées de test------------------------------------------


  // Modifier les données de test pour correspondre aux nouveaux niveaux
  const testScoringData = {
    chart_data: [
      { period: "Jan", score: -4, level: "Danger", interpretation: "Déclin rapide" },
      { period: "Feb", score: -2, level: "Danger", interpretation: "Déclin progressif" },
      { period: "Mar", score: 0, level: "Alerte", interpretation: "Risque Déclin" },
      { period: "Apr", score: 2, level: "Normal", interpretation: "Stable" },
      { period: "May", score: 4, level: "Normal", interpretation: "Amélioration" },
      { period: "Jun", score: 6, level: "Normal", interpretation: "Bonne progression" }
    ]
  };

  const handleClosePreview = () => {
    setOpenPreview(false);
    setSelectedFile(null);
    setPreviewData("");
  };
  
  

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />

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
            Download Reports
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
            title="12,361"
            subtitle="Emails Sent"
            progress="0.75"
            increase="+14%"
            icon={
              <EmailIcon
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
            title="431,225"
            subtitle="Sales Obtained"
            progress="0.50"
            increase="+21%"
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
            title="32,441"
            subtitle="New Clients"
            progress="0.30"
            increase="+5%"
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
            title="1,325,134"
            subtitle="Traffic Received"
            progress="0.80"
            increase="+43%"
            icon={
              <TrafficIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
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
                variant="h4"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Vitesse de marche
              </Typography>
              <Typography
                variant="h3"
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
      Nombre de transitions
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
          <Typography variant="h5" fontWeight="600">
            Score Global Mobilité
          </Typography>
          <Box height="250px" mt="-20px">
            <GlobalScoringBarChart 
              isDashboard={true}
              data={getScoringData()} 
            />
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
        variant="h4"
        fontWeight="600"
        color={colors.grey[100]}
      >
        Durée moyenne des repas
      </Typography>
      <Typography
                variant="h3"
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
      Nombre de transitions
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
          padding="30px"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Geography Based Traffic
          </Typography>
          <Box height="200px">
            <GeographyChart isDashboard={true} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;