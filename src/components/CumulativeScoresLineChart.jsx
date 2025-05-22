import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";

const CumulativeScoresLineChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // fonction pour extraire et formater les données depuis le sessionStorage
  const getCumulativeScoresData = () => {
    try {
      const savedData = sessionStorage.getItem('analysisData');
      if (!savedData) return null;

      const analysisData = JSON.parse(savedData);
      if (!analysisData?.scoring?.raw) return null;

      const speedData = [];
      const transitionsData = [];

      analysisData.scoring.raw.forEach(item => {
        if (item.period && item.cumulative_score_speed !== undefined && item.cumulative_score_speed !== "") {
          speedData.push({
            x: item.period,
            y: Number(item.cumulative_score_speed)
          });
        }

        if (item.period && item.cumulative_score_transitions !== undefined && item.cumulative_score_transitions !== "") {
          transitionsData.push({
            x: item.period,
            y: Number(item.cumulative_score_transitions)
          });
        }
      });

      // Retourner les données au format attendu par Nivo
      return [
        {
          id: "Score Vitesse",
          color: colors.redAccent[500],
          data: speedData
        },
        {
          id: "Score Transitions",
          color: colors.blueAccent[500],
          data: transitionsData
        }
      ];
    } catch (error) {
      console.error("Error processing cumulative scores data:", error);
      return null;
    }
  };

  const chartData = getCumulativeScoresData();

  if (!chartData) {
    return (
      <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: colors.grey[100] }}>Aucune donnée de score cumulé disponible</p>
      </div>
    );
  }

  return (
    <ResponsiveLine
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
            background: colors.primary[400],
          },
        },
      }}
      colors={({ id }) => {
        if (id === "Score Vitesse") return colors.redAccent[500];
        if (id === "Score Transitions") return colors.blueAccent[500];
        return colors.grey[500];
      }}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: false,
      }}
      yFormat=" >-.2f"
      curve="linear"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -35,
        legend: isDashboard ? undefined : "Période",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        legend: isDashboard ? undefined : "Score cumulé",
        legendOffset: -40,
        orient: "left",
        tickValues: 5,
        tickSize: 3,
        tickPadding: 5,
        tickRotation: 0,
        legendPosition: "middle",
      }}
      enableGridX={false}
      enableGridY={false}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemOpacity: 1
              },
            },
          ],
        },
      ]}
      tooltip={({ point }) => (
        <div
          style={{
            background: colors.primary[400],
            padding: '12px',
            border: `1px solid ${colors.grey[100]}`,
            borderRadius: '4px',
          }}
        >
          <div style={{ color: point.serieColor, fontWeight: 'bold' }}>
            {point.serieId}
          </div>
          <div style={{ color: colors.grey[100] }}>
            Période: <strong>{point.data.x}</strong>
          </div>
          <div style={{ color: colors.grey[100] }}>
            Score: <strong>{point.data.y}</strong>
          </div>
        </div>
      )}
    />
  );
};

export default CumulativeScoresLineChart;