import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Home() {
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
                آسان سی وی میں خوش آمدید
            </Typography>

            <Paper elevation={6} sx={{ p: 4, borderRadius: 3, mt: 3, width: '100%', maxWidth: 400 }}>
                <Box display="flex" flexDirection="column" gap={3} alignItems="center">
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => navigate('/create-cv')}
                        sx={{
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            fontFamily: 'Noto Nastaliq Urdu, serif',
                            py: 2
                        }}
                    >
                        اپنا سی وی بنائیں
                    </Button>

                    <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={() => navigate('/find-jobs')}
                        sx={{
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            fontFamily: 'Noto Nastaliq Urdu, serif',
                            py: 2
                        }}
                    >
                        نوکریاں تلاش کریں
                    </Button>

                    <Button
                        variant="outlined"
                        color="success"
                        fullWidth
                        onClick={() => navigate('/view-cvs')}
                        sx={{
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            fontFamily: 'Noto Nastaliq Urdu, serif',
                            py: 2
                        }}
                    >
                        پچھلے سی ویز دیکھیں
                    </Button>
                </Box>
            </Paper>

        </Box>
    );
}
