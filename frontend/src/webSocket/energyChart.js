import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import WebSocketService from '../webSocket/wb';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const EnergyConsumptionChart = ({ deviceId }) => {
    const [energyData, setEnergyData] = useState([]);
    const [labels, setLabels] = useState([]);

    const handleEnergyData = (data) => {
        console.log('Received energy data:', data);
        const sortedData = Object.entries(data)
            .map(([timestamp, consumption]) => {
                const date = new Date(timestamp); 
                const hours = date.getHours();
                return { timestamp, hours, consumption }; 
            })
            .sort((a, b) => {
                return new Date(a.timestamp) - new Date(b.timestamp); 
            });
    
        const timestamps = sortedData.map(item => {
            const date = new Date(item.timestamp);
            return `${date.getHours()}:00`;  
        });
    
        const consumptionValues = sortedData.map(item => item.consumption);
    
        setLabels(timestamps);  
        setEnergyData(consumptionValues); 
    };

    useEffect(() => {
        WebSocketService.setEnergyHandler(handleEnergyData);
        WebSocketService.connect(deviceId);
        return () => {
            WebSocketService.disconnect();
        };
    }, [deviceId]);

    const chartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Energy Consumption Over Time',
            },
        },
    };

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Energy Consumption (kWh)',
                data: energyData,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: 'start',
            },
        ],
    };

    return <Line data={chartData} options={chartOptions} />;
};

export default EnergyConsumptionChart;
