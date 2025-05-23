import {
    CCol,
    CDropdown,
    CDropdownMenu,
    CDropdownItem,
    CDropdownToggle,
    CWidgetStatsA,
} from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilOptions } from '@coreui/icons'
import { getStyle } from '@coreui/utils'
import React from 'react';


export const SensorWidget = ({ sensorKey, sensorName, partCode, offLabel, data, getTempColor }) => {
    const chartRef = React.useRef(null); // Ref riêng cho mỗi chart

    const sensorData = data && data[sensorKey];
    const sensors = sensorData && sensorData.sensors;

    // Logic cho color
    const color = sensors && typeof sensors[0] === 'number' ? getTempColor(sensors[0]) : 'primary';

    // Logic cho value
    const value = (() => {
        if (sensors && sensors.length >= 8) {
            if (sensors.every(v => v === 0)) {
                return (
                    <>
                        <span className="fs-2 fw-bold text-danger" style={{ lineHeight: 1 }}>
                            OFF
                        </span>
                        <div className="fs-6 fw-bold">{offLabel}</div>
                    </>
                );
            }
            const arr = sensors.slice(2, 8).filter(v => typeof v === 'number');
            if (arr.length === 0) return '--';
            const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
            return (
                <>
                    <span className="fs-2 fw-bold" style={{ lineHeight: 1 }}>
                        {avg.toFixed(2)}
                    </span>{' '}
                    <span className="fs-6 fw-normal">°C</span>
                    <div className="fs-6 fw-bold">{sensorName} ({partCode})</div>
                </>
            );
        }
        return '--';
    })();

    // Logic cho title
    const title = (
        <>
            Updated: {sensorData && sensorData.timestamp ? new Date(sensorData.timestamp).toLocaleTimeString() : '--'}
        </>
    );

    // Logic cho chart
    const chartData = {
        labels: ['Sensor 1', 'Sensor 2', 'Sensor 3', 'Sensor 4', 'Sensor 5', 'Sensor 6'],
        datasets: [
            {
                label: '°C',
                backgroundColor: 'transparent',
                borderColor: 'rgba(255,255,255,.55)',
                pointBackgroundColor: getStyle('--cui-primary'),
                data: sensors && sensors.length >= 8 ? sensors.slice(2, 8).map(v => (typeof v === 'number' ? v : 0)) : [0, 0, 0, 0, 0, 0],
            },
        ],
    };

    const chartOptions = {
        plugins: {
            legend: { display: false },
        },
        maintainAspectRatio: false,
        scales: {
            x: {
                border: { display: false },
                grid: { display: false, drawBorder: false },
                ticks: { display: false },
            },
            y: {
                display: false,
                grid: { display: false },
                ticks: { display: false },
            },
        },
        elements: {
            line: { borderWidth: 1, tension: 0.4 },
            point: { radius: 4, hitRadius: 10, hoverRadius: 4 },
        },
    };

    return (
        <CCol sm={6} xl={4} xxl={3}>
            <CWidgetStatsA
                color={color}
                value={value}
                title={title}
                action={
                    <CDropdown alignment="end">
                        <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                            <CIcon icon={cilOptions} />
                        </CDropdownToggle>
                        <CDropdownMenu>
                            <CDropdownItem>Turn off</CDropdownItem>
                            <CDropdownItem>Change temp</CDropdownItem>
                        </CDropdownMenu>
                    </CDropdown>
                }
                chart={
                    <CChartLine
                        ref={chartRef}
                        className="mt-3 mx-3"
                        style={{ height: '70px' }}
                        data={chartData}
                        options={chartOptions}
                    />
                }
            />
        </CCol>
    );
};