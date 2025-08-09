import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function FindJobs() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(to right, #f9f9f9, #dbeafe)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                direction: 'rtl',
                fontFamily: 'Noto Nastaliq Urdu, serif',
                padding: 4
            }}
        >
            <Typography variant="h3" gutterBottom>
                نوکریاں تلاش کریں
            </Typography>

            <Paper elevation={6} sx={{ p: 4, borderRadius: 3, mt: 3, width: '100%', maxWidth: 600 }}>
                <Box display="flex" flexDirection="column" gap={3} alignItems="center">
                    <Typography variant="h6" textAlign="center">
                        یہ فیچر جلد ہی دستیاب ہوگا
                    </Typography>
                    
                    <Typography variant="body1" textAlign="center" color="text.secondary">
                        ہم آپ کے لیے بہترین نوکریاں تلاش کرنے کا نظام تیار کر رہے ہیں
                    </Typography>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/')}
                        sx={{
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            fontFamily: 'Noto Nastaliq Urdu, serif',
                            py: 1.5,
                            px: 3
                        }}
                    >
                        واپس جائیں
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
