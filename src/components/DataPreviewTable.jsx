import { Box, Typography, Paper } from "@mui/material";

const DataPreviewTable = ({ data, colors }) => {
  const rows = data.split('\n').filter(row => row.trim() !== '');
  
  return (
    <Box>
      <Typography variant="h6" mb={2} color={colors.grey[100]}>
        Aperçu (5 premières lignes)
      </Typography>
      <Paper 
        elevation={0} 
        sx={{ 
          backgroundColor: colors.primary[400],
          p: 2,
          maxHeight: 300,
          overflow: 'auto',
          fontFamily: 'monospace'
        }}
      >
        {rows.slice(0, 5).map((row, i) => (
          <Typography 
            key={i} 
            color={colors.grey[100]}
            sx={{ whiteSpace: 'pre-wrap' }}
          >
            {row}
          </Typography>
        ))}
      </Paper>
      <Typography variant="body2" mt={1} color={colors.grey[100]}>
        {rows.length - 1} lignes détectées
      </Typography>
    </Box>
  );
};

export default DataPreviewTable;