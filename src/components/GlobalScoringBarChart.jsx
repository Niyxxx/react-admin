import { useTheme, Box, Typography } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";

const GlobalScoringBarChart = ({ isDashboard = false, data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  if (!data || !data.chart_data || data.chart_data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography variant="h6" color={colors.grey[300]}>
          Aucune donnée de score à afficher
        </Typography>
      </Box>
    );
  }

  // Préparer les données pour Nivo
  const chartData = data.chart_data.map(item => ({
    period: item.period,
    score: item.score,
    level: item.level,
    interpretation: item.interpretation,
    color: item.color || 
           (item.level === "Danger" ? colors.redAccent[500] : 
            item.level === "Alerte" ? colors.orangeAccent[500] : 
            colors.greenAccent[500])
  }));

  // Trouver les valeurs min/max pour l'échelle Y
  const minScore = Math.min(...chartData.map(d => d.score), 0);
  const maxScore = Math.max(...chartData.map(d => d.score), 0);

  return (
    <ResponsiveBar
      data={chartData}
      keys={["score"]} // La propriété à afficher comme hauteur de barre
      indexBy="period" // La propriété pour l'axe X
      margin={{ top: 50, right: 30, bottom: 70, left: 60 }}
      padding={0.3}
      valueScale={{ 
        type: "linear",
        min: minScore - 1, // Ajoute un peu de marge
        max: maxScore + 1  // Ajoute un peu de marge
      }}
      colors={({ data }) => data.color}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        tooltip: {
          container: {
            color: colors.primary[500],
          },
        },
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -45,
        legend: isDashboard ? undefined : 'Périodes',
        legendPosition: "middle",
        legendOffset: 50,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : 'Score cumulé',
        legendPosition: "middle",
        legendOffset: -40,
      }}

      tooltip={({ id, value, indexValue, data }) => (
        <Box
          sx={{
            background: colors.primary[700],
            padding: "12px",
            borderRadius: "4px",
            boxShadow: theme.shadows[10],
            color: colors.grey[100],
            minWidth: "220px"
          }}
        >
          <Typography variant="h6" sx={{ 
            color: colors.greenAccent[500],
            fontWeight: 'bold',
            mb: 1,
            fontSize: '1rem'
          }}>
            {indexValue}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '8px 16px' }}>
            <Typography component="span" sx={{ fontWeight: 'bold' }}>Score:</Typography>
            <Typography component="span">{value}</Typography>
            
            <Typography component="span" sx={{ fontWeight: 'bold' }}>Niveau:</Typography>
            <Typography component="span" sx={{ color: data.color, fontWeight: 'bold' }}>
              {data.level}
            </Typography>
            
            <Typography component="span" sx={{ fontWeight: 'bold' }}>Interprétation:</Typography>
            <Typography component="span" sx={{ fontStyle: 'italic' }}>
              {data.interpretation}
            </Typography>
          </Box>
        </Box>
      )}
    />
  );
};

export default GlobalScoringBarChart;