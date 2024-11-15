import React, { useEffect, useState } from 'react';
import { Table, Text } from '@mantine/core';

type RawData = {
  "Country": string;
  "Year": string;
  "Crop Name": string;
  "Crop Production (UOM:t(Tonnes))": string;
  "Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))": string;
  "Area Under Cultivation (UOM:Ha(Hectares))": string;
};


type DataRow = {
  Year: string;
  CropName: string;
  CropProduction: number;
  Yield: number;
  CultivationArea: number;
};

type AggregatedData = {
  Year: string;
  MaxProductionCrop: string;
  MinProductionCrop: string;
};

type CropAggregation = {
  Crop: string;
  AvgYield: number;
  AvgArea: number;
};

const AgriTable: React.FC = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [maxMinProduction, setMaxMinProduction] = useState<AggregatedData[]>([]);
  const [cropAggregation, setCropAggregation] = useState<CropAggregation[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/data/Manufac _ India Agro Dataset.json');
      const rawData: RawData[] = await response.json();

      const transformedData = rawData.map((user) => ({
        CultivationArea: parseFloat(user["Area Under Cultivation (UOM:Ha(Hectares))"]) ,
        Country: user["Country"],
        CropName: user["Crop Name"],
        CropProduction: parseFloat(user["Crop Production (UOM:t(Tonnes))"]) ,
        Yield: parseFloat(user["Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))"]) ,
        Year: user["Year"]
      }));

      setData(transformedData);
      aggregateData(transformedData);
    };

    fetchData();
  }, []);

  const aggregateData = (data: DataRow[]) => {
    const years = [...new Set(data.map((row) => row.Year))];
    const maxMinProduction: AggregatedData[] = [];

    years.forEach((year) => {
      const yearData = data.filter((row) => row.Year === year);
      const validYearData = yearData.filter(row => row.CropProduction >= 0);
      const minProductionValue = Math.min(...validYearData.map(row => row.CropProduction));
      const minProdCrops = validYearData.filter(row => row.CropProduction === minProductionValue);
      const maxProdCrop = validYearData.reduce((max, row) => row.CropProduction > max.CropProduction ? row : max, validYearData[0]);
      const minCrops = minProdCrops.map(crop => crop.CropName).join(", ");

      maxMinProduction.push({
        Year: year,
        MaxProductionCrop: maxProdCrop.CropName,
        MinProductionCrop: minCrops
      });
    });
   
    setMaxMinProduction(maxMinProduction);

    
    const crops = [...new Set(data.map((row) => row.CropName))];
    const cropAggregation: CropAggregation[] = crops.map((crop) => {
      const cropData = data.filter((row) => row.CropName === crop);
      const validCropData = cropData.filter(row => row.Yield >= 0 && row.CultivationArea >= 0);
      const totalYield = validCropData.reduce((sum, row) => sum + row.Yield, 0);
      const totalArea = validCropData.reduce((sum, row) => sum + row.CultivationArea, 0);
      const avgYield = validCropData.length > 0 ? parseFloat((totalYield / validCropData.length).toFixed(3)) : 0;
      const avgArea = validCropData.length > 0 ? parseFloat((totalArea / validCropData.length).toFixed(3)) : 0;
   
      return {
        Crop: crop,
        AvgYield: avgYield,
        AvgArea: avgArea,
      };
    });

    setCropAggregation(cropAggregation);
  };
  console.log(data)
 
  const maxMinRows = maxMinProduction.map((row) => (
    <Table.Tr key={row.Year}>
      <Table.Td>{row.Year}</Table.Td>
      <Table.Td>{row.MaxProductionCrop}</Table.Td>
      <Table.Td>{row.MinProductionCrop}</Table.Td>
    </Table.Tr>
  ));

  
  const cropAggregationRows = cropAggregation.map((row) => (
    <Table.Tr key={row.Crop}>
      <Table.Td>{row.Crop}</Table.Td>
      <Table.Td>{row.AvgYield}</Table.Td>
      <Table.Td>{row.AvgArea}</Table.Td>
    </Table.Tr>
  ));

  return (
    <div style={{ justifyContent: 'center', marginLeft: "20%" }}>
      <Text style={{ margin: '20px', fontWeight: 500 }} size="xl">
        Crop Production Analysis (1950-2020)
      </Text>

      <Table
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
        withRowBorders
        stickyHeader
        style={{ marginBottom: '30px', overflowX: 'auto', maxHeight: '400px', width: '35%', display: 'block', textAlign: 'center' }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Year</Table.Th>
            <Table.Th>Crop with Maximum Production</Table.Th>
            <Table.Th>Crop with Minimum Production</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{maxMinRows}</Table.Tbody>
      </Table>

      <Text style={{ margin: '20px', fontWeight: 500 }} size="xl">
        Crop Average Yield and Area (1950-2020)
      </Text>

      <Table
        highlightOnHover
        withTableBorder
        withColumnBorders
        withRowBorders
        stickyHeader
        style={{ overflowX: 'auto', maxHeight: '350px', width: '28%', display: 'block', textAlign: 'center' }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Crop</Table.Th>
            <Table.Th>Average Yield</Table.Th>
            <Table.Th>Average Cultivation Area</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{cropAggregationRows}</Table.Tbody>
      </Table>
    </div>
  );
};

export default AgriTable;
