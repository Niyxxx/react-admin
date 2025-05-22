import { Box } from "@mui/material";
import Header from "../../components/Header";
import CumulativeScoresLineChart from "../../components/CumulativeScoresLineChart";

const Pie = () => {
  return (
    <Box m="20px">
      <Header 
        title="Scores Cumulatifs" 
        subtitle="Évolution des scores cumulatifs de vitesse et transitions" 
      />
      <Box height="75vh">
        <CumulativeScoresLineChart />
      </Box>
    </Box>
  );
};

export default Pie;