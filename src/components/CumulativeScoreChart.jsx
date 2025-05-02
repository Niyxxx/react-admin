import { ResponsiveBar } from '@nivo/bar';
import { useTheme, Box, Typography } from '@mui/material';
import { tokens } from '../theme';

const GlobalScoringBarChart = ({ data, isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  if (!data || !data.chart_data || data.chart_data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography variant="h6" color="textSecondary">
          Aucune donnée de scoring à afficher
        </Typography>
      </Box>
    );
  }

  // Trouver les valeurs min/max pour l'échelle
  const minScore = Math.min(...data.chart_data.map(item => Number(item.score)));
  const maxScore = Math.max(...data.chart_data.map(item => Number(item.score)));

  const getColor = (bar) => {
    const value = bar.data.score;
    if (value < 0) return colors.redAccent[500]; // Négatif = rouge
    if (value === 0) return colors.orangeAccent[500]; // Zéro = orange
    return colors.greenAccent[500]; // Positif = vert
  };

  

  return (
    <Box height="100%">
      <Box height={isDashboard ? 'calc(100% - 40px)' : 'calc(100% - 60px)'}>
        <ResponsiveBar
          data={data.chart_data}
          keys={['score']}
          enableGridY={true}
          gridYValues={[-6, -4, -2, 0, 2, 4, 6]} // Ajustez selon vos valeurs
          layout="vertical"
          indexBy="period"
          colors={getColor}
          margin={{
            top: 20,
            right: 30,
            bottom: isDashboard ? 40 : 80,
            left: 60
          }}
          padding={0.4}
          minValue={Math.min(minScore, 0)} // Inclut les valeurs négatives
          maxValue={Math.max(maxScore, 0)} // Inclut les valeurs positives
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          axisBottom={{
            tickRotation: -45,
            legend: isDashboard ? undefined : 'Périodes',
            legendPosition: 'middle',
            legendOffset: 60
          }}
          axisLeft={{
            legend: isDashboard ? undefined : 'Score Global',
            legendOffset: -40,
            legendPosition: 'middle',
            tickValues: 5 // Nombre de ticks sur l'axe Y
          }}
          enableLabel={false}
          tooltip={({ indexValue, data }) => (
            <Box p="10px" bgcolor={colors.primary[400]} borderRadius="4px">
              <strong>Période: {indexValue}</strong>
              <br />
              <Box display="flex" alignItems="center" mt="5px">
                <Box 
                  width="12px" 
                  height="12px" 
                  bgcolor={getColor({ data })} 
                  mr="5px" 
                  borderRadius="2px"
                />
                Niveau: {data.level}
              </Box>
              <Box mt="5px">Score: {data.score}</Box>
              {data.interpretation && (
                <Box mt="5px" fontStyle="italic">{data.interpretation}</Box>
              )}
            </Box>
          )}
          motionConfig="gentle"
        />
      </Box>

      {/* Légende améliorée */}
      <Box display="flex" justifyContent="center" gap="20px" mt="10px">
        <Box display="flex" alignItems="center">
          <Box width="16px" height="16px" bgcolor={colors.greenAccent[500]} mr="5px" borderRadius="2px"/>
          <Typography variant="caption">Score positif</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Box width="16px" height="16px" bgcolor={colors.orangeAccent[500]} mr="5px" borderRadius="2px"/>
          <Typography variant="caption">Score nul</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Box width="16px" height="16px" bgcolor={colors.redAccent[500]} mr="5px" borderRadius="2px"/>
          <Typography variant="caption">Score négatif</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default GlobalScoringBarChart;