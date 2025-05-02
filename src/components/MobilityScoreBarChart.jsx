import { useTheme, Box, Typography } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";

const MobilityScoreBarChart = ({ isDashboard = false, data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  if (!data || !data.data || data.data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography variant="h6" color={colors.grey[300]}>
          Aucune donnée de mobilité disponible
        </Typography>
      </Box>
    );
  }

  // Préparation des données avec hauteur constante
  const chartData = data.data.map(item => ({
    period: item.period,
    value: 1, // Valeur constante pour même hauteur
    level: item.level,
    interpretation: item.interpretation,
    color: item.level === 'Normal' ? colors.greenAccent[500] :
           item.level === 'Alerte' ? colors.orangeAccent[500] :
           colors.redAccent[500]
  }));

  return (
    <ResponsiveBar
      data={chartData}
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
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
        tooltip: {
          container: {
            color: colors.primary[500],
            background: colors.primary[700],
          },
        },
      }}
      keys={['value']}
      indexBy="period"
      margin={{ top: 50, right: 30, bottom: 50, left: 60 }}
      padding={0.3}
      valueScale={{ type: "linear", min: 0, max: 1 }}
      indexScale={{ type: "band", round: true }}
      colors={({ data }) => data.color}
      borderColor={{
        from: "color",
        modifiers: [["darker", "1.6"]],
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -45,
        legend: isDashboard ? undefined : 'Période',
        legendPosition: "middle",
        legendOffset: 32,
      }}
      axisLeft={null}
      enableGridY={false}
      enableLabel={false}
      labelSkipWidth={12}
      labelSkipHeight={12}
      tooltip={({ indexValue, data }) => (
        <div style={{
          padding: '12px',
          background: colors.primary[700],
          color: colors.grey[100],
          borderLeft: `5px solid ${data.color}`,
          borderRadius: '4px'
        }}>
          <strong>{indexValue}</strong>
          <div>Statut: {data.level}</div>
          <div>Interprétation: {data.interpretation}</div>
        </div>
      )}
      role="application"
      barAriaLabel={function (e) {
        return e.id + ": " + e.formattedValue + " en " + e.indexValue + " - " + e.data.interpretation;
      }}
    />
  );
};

export default MobilityScoreBarChart;