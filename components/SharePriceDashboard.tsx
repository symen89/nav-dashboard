'use client';

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';

// Echte Share Price data (EUR) - historisch + API data
const SHARE_PRICES: Record<string, number> = {"2022-03-01": 1000.0, "2022-03-08": 1000.0, "2022-03-15": 991.33, "2022-03-22": 1025.29, "2022-03-29": 1079.22, "2022-04-05": 1111.38, "2022-04-12": 982.24, "2022-04-19": 1024.53, "2022-04-26": 1022.52, "2022-05-03": 974.75, "2022-05-10": 808.83, "2022-05-17": 775.13, "2022-05-24": 749.77, "2022-05-31": 775.59, "2022-06-07": 752.05, "2022-06-14": 582.08, "2022-06-21": 570.25, "2022-06-28": 585.01, "2022-07-05": 579.07, "2022-07-12": 582.72, "2022-07-19": 731.75, "2022-07-26": 665.1, "2022-08-02": 739.95, "2022-08-09": 792.5, "2022-08-16": 816.35, "2022-08-23": 733.13, "2022-08-30": 692.25, "2022-09-06": 712.4, "2022-09-13": 739.77, "2022-09-20": 638.45, "2022-09-27": 665.24, "2022-10-04": 646.8, "2022-10-11": 646.94, "2022-10-18": 656.07, "2022-10-25": 649.25, "2022-11-01": 713.61, "2022-11-08": 709.63, "2022-11-15": 570.7, "2022-11-22": 531.81, "2022-11-29": 552.65, "2022-12-06": 578.24, "2022-12-13": 571.03, "2022-12-20": 514.28, "2022-12-27": 533.53, "2023-01-03": 521.02, "2023-01-10": 558.19, "2023-01-17": 647.6, "2023-01-24": 664.67, "2023-01-31": 651.93, "2023-02-07": 677.34, "2023-02-14": 649.8, "2023-02-21": 744.16, "2023-02-28": 700.46, "2023-03-07": 666.75, "2023-03-14": 687.09, "2023-03-21": 709.56, "2023-03-28": 686.62, "2023-04-04": 712.6, "2023-04-11": 744.88, "2023-04-18": 788.98, "2023-04-25": 693.08, "2023-05-02": 694.77, "2023-05-09": 683.48, "2023-05-16": 679.19, "2023-05-23": 680.53, "2023-05-30": 710.62, "2023-06-06": 671.71, "2023-06-13": 626.5, "2023-06-20": 619.72, "2023-06-27": 672.93, "2023-07-04": 717.49, "2023-07-11": 687.21, "2023-07-18": 696.1, "2023-07-25": 693.4, "2023-08-01": 703.87, "2023-08-08": 687.72, "2023-08-15": 699.52, "2023-08-22": 615.9, "2023-08-29": 611.39, "2023-09-05": 614.26, "2023-09-12": 603.59, "2023-09-19": 632.76, "2023-09-26": 640.52, "2023-10-03": 659.68, "2023-10-10": 623.39, "2023-10-17": 631.17, "2023-10-24": 747.68, "2023-10-31": 754.23, "2023-11-07": 881.22, "2023-11-14": 817.67, "2023-11-21": 849.53, "2023-11-28": 849.15, "2023-12-05": 948.96, "2023-12-12": 925.75, "2023-12-19": 899.06, "2023-12-26": 952.49, "2024-01-02": 925.85, "2024-01-09": 1019.6, "2024-01-16": 938.26, "2024-01-23": 871.51, "2024-01-30": 928.75, "2024-02-06": 962.13, "2024-02-13": 1070.91, "2024-02-20": 1063.65, "2024-02-27": 1177.26, "2024-03-05": 1295.6, "2024-03-12": 1325.87, "2024-03-19": 1223.59, "2024-03-26": 1271.88, "2024-04-02": 1187.02, "2024-04-09": 1219.06, "2024-04-16": 1057.81, "2024-04-23": 1091.21, "2024-04-30": 1026.22, "2024-05-07": 1050.94, "2024-05-14": 1043.68, "2024-05-21": 1233.07, "2024-05-28": 1228.62, "2024-06-04": 1241.5, "2024-06-11": 1141.43, "2024-06-18": 1125.56, "2024-06-25": 1109.26, "2024-07-02": 977.69, "2024-07-09": 983.23, "2024-07-16": 1120.33, "2024-07-23": 1087.52, "2024-07-30": 976.35, "2024-08-06": 886.22, "2024-08-13": 859.13, "2024-08-20": 928.77, "2024-08-27": 856.06, "2024-09-03": 757.35, "2024-09-10": 843.34, "2024-09-17": 873.43, "2024-09-24": 928.25, "2024-10-01": 849.66, "2024-10-08": 859.05, "2024-10-15": 921.31, "2024-10-22": 880.17, "2024-10-29": 902.76, "2024-11-05": 1065.32, "2024-11-12": 1152.67, "2024-11-19": 1293.77, "2024-11-26": 1330.32, "2024-12-03": 1469.65, "2024-12-10": 1478.59, "2024-12-17": 1354.16, "2024-12-24": 1306.32, "2024-12-31": 1399.98, "2025-01-07": 1272.43, "2025-01-14": 1396.77, "2025-01-21": 1343.02, "2025-01-28": 1340.62, "2025-02-04": 1102.92, "2025-02-11": 977.54, "2025-02-18": 950.0, "2025-02-25": 900.0, "2025-03-04": 850.0, "2025-03-11": 780.0, "2025-03-18": 766.78, "2025-04-01": 750.0, "2025-04-08": 712.24, "2025-04-15": 704.23, "2025-04-22": 799.89, "2025-04-29": 799.83, "2025-05-06": 850.0, "2025-05-13": 1011.12, "2025-05-20": 970.01, "2025-05-27": 981.62, "2025-06-03": 962.66, "2025-06-10": 963.48, "2025-06-17": 945.28, "2025-06-24": 879.09, "2025-07-01": 917.58, "2025-07-08": 922.55, "2025-07-15": 1047.26, "2025-07-22": 1213.22, "2025-07-29": 1224.48, "2025-08-05": 1133.34, "2025-08-12": 1332.99, "2025-08-19": 1361.56, "2025-08-26": 1419.67, "2025-09-02": 1337.26, "2025-09-09": 1311.18, "2025-09-16": 1395.01, "2025-09-23": 1356.55, "2025-09-30": 1258.42, "2025-10-07": 1368.55, "2025-10-14": 1193.43, "2025-10-21": 1184.48, "2025-10-28": 1220.74, "2025-11-04": 1051.45, "2025-11-11": 1023.78, "2025-11-18": 900.34, "2025-11-25": 932.81, "2025-12-01": 923.34, "2025-12-02": 856.88, "2025-12-03": 921.94, "2025-12-04": 969.14, "2025-12-05": 953.63, "2025-12-06": 916.08, "2025-12-07": 923.59, "2025-12-08": 926.86, "2025-12-09": 943.94, "2025-12-10": 984.33, "2025-12-11": 976.26, "2025-12-12": 960.11, "2025-12-13": 927.25, "2025-12-14": 930.61, "2025-12-15": 912.45, "2025-12-16": 883.36, "2025-12-17": 883.99, "2025-12-18": 850.68, "2025-12-19": 843.91, "2025-12-20": 883.44, "2025-12-21": 885.56, "2025-12-22": 888.32, "2025-12-23": 883.23, "2025-12-24": 868.21, "2025-12-25": 865.95, "2025-12-26": 858.21, "2025-12-27": 862.49, "2025-12-28": 870.81, "2025-12-29": 869.36, "2025-12-30": 865.44, "2025-12-31": 874.63, "2026-01-01": 867.2, "2026-01-02": 878.91, "2026-01-03": 916.39, "2026-01-04": 925.31, "2026-01-05": 929.09, "2026-01-06": 953.11, "2026-01-07": 968.03, "2026-01-08": 934.11, "2026-01-09": 925.22, "2026-01-10": 922.86, "2026-01-11": 924.22, "2026-01-12": 929.97, "2026-01-13": 922.91, "2026-01-14": 981.79, "2026-01-15": 987.54, "2026-01-16": 979.26, "2026-01-17": 975.06, "2026-01-18": 976.55, "2026-01-19": 952.65, "2026-01-20": 937.94, "2026-01-21": 869.17, "2026-01-22": 886.92, "2026-01-23": 871.98, "2026-01-24": 874.98, "2026-01-25": 870.98, "2026-01-26": 828.73, "2026-01-27": 851.59, "2026-01-28": 865.33, "2026-01-29": 861.81};

// CCI30 data (echte data van cci30.com)
const CCI30_DATA: Record<string, number> = {"2022-03-01": 17069.4, "2022-03-08": 14926.1, "2022-03-15": 15022.7, "2022-03-22": 16660.0, "2022-03-29": 18921.7, "2022-04-05": 18742.0, "2022-04-12": 16186.2, "2022-04-19": 16757.6, "2022-04-26": 14875.4, "2022-05-03": 14024.3, "2022-05-10": 11275.7, "2022-05-17": 10019.4, "2022-05-24": 9583.29, "2022-05-31": 9844.15, "2022-06-07": 9200.85, "2022-06-14": 6713.65, "2022-06-21": 6835.11, "2022-06-28": 6802.49, "2022-07-05": 6806.72, "2022-07-12": 6409.48, "2022-07-19": 8269.02, "2022-07-26": 7457.84, "2022-08-02": 8343.73, "2022-08-09": 8786.6, "2022-08-16": 9169.02, "2022-08-23": 8127.07, "2022-08-30": 7527.2, "2022-09-06": 7334.89, "2022-09-13": 7684.69, "2022-09-20": 7175.77, "2022-09-27": 7304.55, "2022-10-04": 7597.5, "2022-10-11": 7071.59, "2022-10-18": 7100.02, "2022-10-25": 7427.51, "2022-11-01": 8007.54, "2022-11-08": 7162.62, "2022-11-15": 6450.05, "2022-11-22": 6099.05, "2022-11-29": 6398.17, "2022-12-06": 6591.53, "2022-12-13": 6587.49, "2022-12-20": 5963.27, "2022-12-27": 5915.12, "2023-01-03": 5932.02, "2023-01-10": 6487.24, "2023-01-17": 7495.94, "2023-01-24": 7684.87, "2023-01-31": 8007.65, "2023-02-07": 8352.12, "2023-02-14": 7803.35, "2023-02-21": 8421.85, "2023-02-28": 7882.56, "2023-03-07": 7497.88, "2023-03-14": 7937.71, "2023-03-21": 8430.31, "2023-03-28": 8147.29, "2023-04-04": 8509.25, "2023-04-11": 8699.89, "2023-04-18": 9244.8, "2023-04-25": 8357.37, "2023-05-02": 8261.43, "2023-05-09": 7849.65, "2023-05-16": 7827.15, "2023-05-23": 7904.23, "2023-05-30": 8041.09, "2023-06-06": 7807.52, "2023-06-13": 6972.61, "2023-06-20": 7239.35, "2023-06-27": 7834.88, "2023-07-04": 8107.23, "2023-07-11": 8007.36, "2023-07-18": 8375.78, "2023-07-25": 8246.47, "2023-08-01": 8322.07, "2023-08-08": 8213.09, "2023-08-15": 7998.14, "2023-08-22": 7110.04, "2023-08-29": 7530.67, "2023-09-05": 7065.22, "2023-09-12": 6872.44, "2023-09-19": 7309.56, "2023-09-26": 7043.58, "2023-10-03": 7345.78, "2023-10-10": 7091.74, "2023-10-17": 7181.02, "2023-10-24": 8193.12, "2023-10-31": 8521.41, "2023-11-07": 9120.37, "2023-11-14": 9467.95, "2023-11-21": 9172.29, "2023-11-28": 9767.24, "2023-12-05": 10692.1, "2023-12-12": 10894.1, "2023-12-19": 10957.2, "2023-12-26": 11860.9, "2024-01-02": 12301.2, "2024-01-09": 11618.2, "2024-01-16": 11890.7, "2024-01-23": 10664.4, "2024-01-30": 11367.5, "2024-02-06": 11311.2, "2024-02-13": 12552.4, "2024-02-20": 13463.1, "2024-02-27": 14300.7, "2024-03-05": 16351.7, "2024-03-12": 18814.8, "2024-03-19": 15948.1, "2024-03-26": 18493.8, "2024-04-02": 17207.6, "2024-04-09": 17842.4, "2024-04-16": 15159.1, "2024-04-23": 16174.5, "2024-04-30": 14642.6, "2024-05-07": 15272.5, "2024-05-14": 14818.7, "2024-05-21": 17261.6, "2024-05-28": 16879.0, "2024-06-04": 17117.3, "2024-06-11": 15536.1, "2024-06-18": 14630.9, "2024-06-25": 14461.4, "2024-07-02": 14722.9, "2024-07-09": 13398.8, "2024-07-16": 15123.7, "2024-07-23": 15133.9, "2024-07-30": 14859.8, "2024-08-06": 12088.8, "2024-08-13": 13006.3, "2024-08-20": 12932.4, "2024-08-27": 12783.5, "2024-09-03": 12157.7, "2024-09-10": 12469.3, "2024-09-17": 12569.8, "2024-09-24": 13814.3, "2024-10-01": 13079.1, "2024-10-08": 13210.3, "2024-10-15": 13949.9, "2024-10-22": 14041.0, "2024-10-29": 14538.4, "2024-11-05": 13581.9, "2024-11-12": 18178.8, "2024-11-19": 19596.6, "2024-11-26": 21132.5, "2024-12-03": 25271.0, "2024-12-10": 23566.1, "2024-12-17": 24986.4, "2024-12-24": 22768.1, "2024-12-31": 21207.8, "2025-01-07": 21985.4, "2025-01-14": 21723.1, "2025-01-21": 23440.7, "2025-01-28": 21558.8, "2025-02-04": 19150.4, "2025-02-11": 18791.6, "2025-02-18": 18493.0, "2025-02-25": 16994.2, "2025-03-04": 16430.8, "2025-03-11": 14884.1, "2025-03-18": 15376.9, "2025-03-25": 16425.5, "2025-04-01": 15377.7, "2025-04-08": 13132.4, "2025-04-15": 14201.6, "2025-04-22": 15787.0, "2025-04-29": 15985.8, "2025-05-06": 15888.2, "2025-05-13": 19094.6, "2025-05-20": 18261.5, "2025-05-27": 18789.6, "2025-06-03": 17801.8, "2025-06-10": 18773.4, "2025-06-17": 17128.7, "2025-06-24": 17056.3, "2025-07-01": 16461.4, "2025-07-08": 17259.2, "2025-07-15": 19841.9, "2025-07-22": 22106.6, "2025-07-29": 20951.1, "2025-08-05": 19722.1, "2025-08-12": 22150.5, "2025-08-19": 20734.4, "2025-08-26": 21812.9, "2025-09-02": 21127.1, "2025-09-09": 21583.9, "2025-09-16": 22653.8, "2025-09-23": 21387.7, "2025-09-30": 21304.7, "2025-10-07": 22417.7, "2025-10-14": 20139.5, "2025-10-21": 18813.0, "2025-10-28": 19603.5, "2025-11-04": 16636.8, "2025-11-11": 17358.8, "2025-11-18": 16008.0, "2025-11-25": 15174.4, "2025-12-01": 14289.2, "2025-12-02": 15220.4, "2025-12-03": 15791.4, "2025-12-04": 15430.7, "2025-12-05": 14906.4, "2025-12-06": 14955.8, "2025-12-07": 14991.1, "2025-12-08": 15135.6, "2025-12-09": 15575.4, "2025-12-10": 15411.8, "2025-12-11": 15281.7, "2025-12-12": 14918.8, "2025-12-13": 15026.6, "2025-12-14": 14638.5, "2025-12-15": 14287.1, "2025-12-16": 14437.4, "2025-12-17": 13896.8, "2025-12-18": 13653.2, "2025-12-19": 14332.7, "2025-12-20": 14392.3, "2025-12-21": 14379.4, "2025-12-22": 14373.2, "2025-12-23": 14138.1, "2025-12-24": 14095.9, "2025-12-25": 13965.7, "2025-12-26": 14087.7, "2025-12-27": 14323.0, "2025-12-28": 14322.6, "2025-12-29": 14157.1, "2025-12-30": 14160.3, "2025-12-31": 14143.0, "2026-01-01": 14291.8, "2026-01-02": 14776.6, "2026-01-03": 14929.2, "2026-01-04": 15120.5, "2026-01-05": 15631.5, "2026-01-06": 15674.1, "2026-01-07": 15166.7, "2026-01-08": 15005.8, "2026-01-09": 14874.6, "2026-01-10": 14861.6, "2026-01-11": 14977.8, "2026-01-12": 14950.7, "2026-01-13": 15746.2, "2026-01-14": 15807.7, "2026-01-15": 15428.8, "2026-01-16": 15393.9, "2026-01-17": 15380.5, "2026-01-18": 15018.8, "2026-01-19": 14769.5, "2026-01-20": 13967.4, "2026-01-21": 14254.1, "2026-01-22": 14194.9, "2026-01-23": 14217.9, "2026-01-24": 14186.7, "2026-01-25": 13623.6, "2026-01-26": 14017.6, "2026-01-27": 14300.6, "2026-01-28": 14296.9};

// Officiële maand-einde NAV (Prijs per Participatie)
const MONTH_END_NAV = [
  { month: "2022-03", date: "2022-03-31", price: 1081.14 },
  { month: "2022-04", date: "2022-04-30", price: 982.76 },
  { month: "2022-05", date: "2022-05-31", price: 775.59 },
  { month: "2022-06", date: "2022-06-30", price: 559.99 },
  { month: "2022-07", date: "2022-07-31", price: 764.59 },
  { month: "2022-08", date: "2022-08-31", price: 673.76 },
  { month: "2022-09", date: "2022-09-30", price: 653.67 },
  { month: "2022-10", date: "2022-10-31", price: 711.56 },
  { month: "2022-11", date: "2022-11-30", price: 570.49 },
  { month: "2022-12", date: "2022-12-31", price: 512.68 },
  { month: "2023-01", date: "2023-01-31", price: 651.93 },
  { month: "2023-02", date: "2023-02-28", price: 700.46 },
  { month: "2023-03", date: "2023-03-31", price: 708.99 },
  { month: "2023-04", date: "2023-04-30", price: 718.11 },
  { month: "2023-05", date: "2023-05-31", price: 710.63 },
  { month: "2023-06", date: "2023-06-30", price: 670.91 },
  { month: "2023-07", date: "2023-07-31", price: 704.70 },
  { month: "2023-08", date: "2023-08-31", price: 621.21 },
  { month: "2023-09", date: "2023-09-30", price: 658.23 },
  { month: "2023-10", date: "2023-10-31", price: 752.04 },
  { month: "2023-11", date: "2023-11-30", price: 838.01 },
  { month: "2023-12", date: "2023-12-31", price: 931.10 },
  { month: "2024-01", date: "2024-01-31", price: 928.08 },
  { month: "2024-02", date: "2024-02-29", price: 1186.65 },
  { month: "2024-03", date: "2024-03-31", price: 1263.32 },
  { month: "2024-04", date: "2024-04-30", price: 1085.46 },
  { month: "2024-05", date: "2024-05-31", price: 1228.62 },
  { month: "2024-06", date: "2024-06-30", price: 1079.60 },
  { month: "2024-07", date: "2024-07-31", price: 1078.65 },
  { month: "2024-08", date: "2024-08-31", price: 856.06 },
  { month: "2024-09", date: "2024-09-30", price: 915.87 },
  { month: "2024-10", date: "2024-10-31", price: 948.57 },
  { month: "2024-11", date: "2024-11-30", price: 1330.32 },
  { month: "2024-12", date: "2024-12-31", price: 1296.95 },
  { month: "2025-01", date: "2025-01-31", price: 1330.99 },
  { month: "2025-02", date: "2025-02-28", price: 977.54 },
  { month: "2025-03", date: "2025-03-31", price: 774.58 },
  { month: "2025-04", date: "2025-04-30", price: 784.35 },
  { month: "2025-05", date: "2025-05-31", price: 958.98 },
  { month: "2025-06", date: "2025-06-30", price: 937.21 },
  { month: "2025-07", date: "2025-07-31", price: 1263.63 },
  { month: "2025-08", date: "2025-08-31", price: 1337.26 },
  { month: "2025-09", date: "2025-09-30", price: 1311.45 },
  { month: "2025-10", date: "2025-10-30", price: 1212.64 },
  { month: "2025-11", date: "2025-11-30", price: 923.36 },
  { month: "2025-12", date: "2025-12-31", price: 874.63 },
  { month: "2026-01", date: "2026-01-29", price: 861.81, note: "MTD" },
];

const MONTH_NAMES = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

export default function SharePriceDashboard() {
  const allDates = useMemo(() => Object.keys(SHARE_PRICES).sort(), []);

  const [view, setView] = useState('both');
  const [showTable, setShowTable] = useState(true);
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(allDates.length - 1);
  const [startDateInput, setStartDateInput] = useState(allDates[0]);
  const [endDateInput, setEndDateInput] = useState(allDates[allDates.length - 1]);

  // Preset periods
  const presets = [
    { label: 'Alles', start: 0, end: allDates.length - 1 },
    { label: 'YTD', start: allDates.findIndex(d => d >= '2026-01-01'), end: allDates.length - 1 },
    { label: '2025', start: allDates.findIndex(d => d >= '2025-01-01'), end: allDates.findIndex(d => d >= '2026-01-01') - 1 },
    { label: '2024', start: allDates.findIndex(d => d >= '2024-01-01'), end: allDates.findIndex(d => d >= '2025-01-01') - 1 },
    { label: '2023', start: allDates.findIndex(d => d >= '2023-01-01'), end: allDates.findIndex(d => d >= '2024-01-01') - 1 },
    { label: '6M', start: Math.max(0, allDates.length - 26), end: allDates.length - 1 },
    { label: '3M', start: Math.max(0, allDates.length - 13), end: allDates.length - 1 },
    { label: '1M', start: Math.max(0, allDates.length - 5), end: allDates.length - 1 },
  ];

  const applyPreset = (preset: { label: string; start: number; end: number }) => {
    const start = Math.max(0, preset.start);
    const end = Math.min(allDates.length - 1, preset.end);
    setRangeStart(start);
    setRangeEnd(end);
    setStartDateInput(allDates[start]);
    setEndDateInput(allDates[end]);
  };

  const handleDateInputChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDateInput(value);
      const idx = allDates.findIndex(d => d >= value);
      if (idx !== -1) setRangeStart(idx);
    } else {
      setEndDateInput(value);
      const idx = allDates.findIndex(d => d > value);
      if (idx !== -1) setRangeEnd(idx - 1);
      else setRangeEnd(allDates.length - 1);
    }
  };

  const handleSliderChange = (type: 'start' | 'end', value: string) => {
    const idx = parseInt(value);
    if (type === 'start') {
      setRangeStart(Math.min(idx, rangeEnd - 1));
      setStartDateInput(allDates[Math.min(idx, rangeEnd - 1)]);
    } else {
      setRangeEnd(Math.max(idx, rangeStart + 1));
      setEndDateInput(allDates[Math.max(idx, rangeStart + 1)]);
    }
  };

  // Filter and compute chart data based on selected range
  const { chartData, stats } = useMemo(() => {
    const filteredDates = allDates.slice(rangeStart, rangeEnd + 1);
    const baseDate = filteredDates[0];
    const basePrice = SHARE_PRICES[baseDate];
    const baseCCI30 = CCI30_DATA[baseDate] || CCI30_DATA[allDates.find(d => CCI30_DATA[d] && d >= baseDate) || ''];

    const data = filteredDates.map(date => {
      const cci30Value = CCI30_DATA[date];
      return {
        date,
        displayDate: new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }),
        sharePrice: SHARE_PRICES[date],
        priceNorm: (SHARE_PRICES[date] / basePrice) * 100,
        cci30Norm: cci30Value ? (cci30Value / baseCCI30) * 100 : null,
      };
    });

    const prices = filteredDates.map(d => SHARE_PRICES[d]);
    const startPrice = prices[0];
    const endPrice = prices[prices.length - 1];
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    const cci30Start = baseCCI30;
    const lastCCI30Date = [...filteredDates].reverse().find(d => CCI30_DATA[d]);
    const cci30End = CCI30_DATA[lastCCI30Date || ''] || cci30Start;

    return {
      chartData: data,
      stats: {
        startPrice,
        endPrice,
        maxPrice,
        minPrice,
        navReturn: ((endPrice - startPrice) / startPrice) * 100,
        cci30Return: ((cci30End - cci30Start) / cci30Start) * 100,
        alpha: ((endPrice - startPrice) / startPrice) * 100 - ((cci30End - cci30Start) / cci30Start) * 100,
        days: filteredDates.length,
        startDate: filteredDates[0],
        endDate: filteredDates[filteredDates.length - 1],
      }
    };
  }, [rangeStart, rangeEnd, allDates]);

  // Group month-end data by year for table
  const navByYear = useMemo(() => {
    const years: Record<string, Record<number, typeof MONTH_END_NAV[0]>> = {};
    MONTH_END_NAV.forEach(item => {
      const year = item.month.split('-')[0];
      if (!years[year]) years[year] = {};
      const monthIdx = parseInt(item.month.split('-')[1]) - 1;
      years[year][monthIdx] = item;
    });
    return years;
  }, []);

  const formatEUR = (v: number) => `€${v.toFixed(2)}`;
  const formatPct = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="p-4 bg-slate-900 min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">A-DAM Capital Share Price</h1>
        <p className="text-slate-400 text-sm mb-4">
          {formatDate(stats.startDate)} - {formatDate(stats.endDate)} ({stats.days} datapunten)
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-xs">Startprijs</p>
            <p className="text-xl font-bold text-white">{formatEUR(stats.startPrice)}</p>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-xs">Eindprijs</p>
            <p className="text-xl font-bold text-white">{formatEUR(stats.endPrice)}</p>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-xs">NAV Return</p>
            <p className={`text-xl font-bold ${stats.navReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPct(stats.navReturn)}
            </p>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-xs">Alpha vs CCI30</p>
            <p className={`text-xl font-bold ${stats.alpha >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPct(stats.alpha)}
            </p>
          </div>
        </div>

        {/* Date Range Controls */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-slate-400 text-sm">Periode:</span>
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Date inputs */}
          <div className="flex flex-wrap gap-4 mb-3">
            <div className="flex items-center gap-2">
              <label className="text-slate-400 text-sm">Van:</label>
              <input
                type="date"
                value={startDateInput}
                min={allDates[0]}
                max={endDateInput}
                onChange={(e) => handleDateInputChange('start', e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-slate-400 text-sm">Tot:</label>
              <input
                type="date"
                value={endDateInput}
                min={startDateInput}
                max={allDates[allDates.length - 1]}
                onChange={(e) => handleDateInputChange('end', e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
              />
            </div>
          </div>

          {/* Range sliders */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-slate-500 text-xs w-12">Start:</span>
              <input
                type="range"
                min="0"
                max={allDates.length - 1}
                value={rangeStart}
                onChange={(e) => handleSliderChange('start', e.target.value)}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-slate-400 text-xs w-24">{formatDate(allDates[rangeStart]).split(' ').slice(0, 2).join(' ')}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-500 text-xs w-12">Eind:</span>
              <input
                type="range"
                min="0"
                max={allDates.length - 1}
                value={rangeEnd}
                onChange={(e) => handleSliderChange('end', e.target.value)}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-slate-400 text-xs w-24">{formatDate(allDates[rangeEnd]).split(' ').slice(0, 2).join(' ')}</span>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <button
            onClick={() => setView('shareprice')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${view === 'shareprice' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
            💶 Share Price
          </button>
          <button
            onClick={() => setView('normalized')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${view === 'normalized' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
            📊 vs CCI30
          </button>
          <button
            onClick={() => setView('both')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${view === 'both' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
            🔄 Beide
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setShowTable(!showTable)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${showTable ? 'bg-emerald-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
            📋 Maandtabel
          </button>
        </div>

        {/* Share Price Chart */}
        {(view === 'shareprice' || view === 'both') && (
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-4">
            <h2 className="text-sm font-medium mb-3 text-slate-300">Share Price (EUR)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="#64748b" 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  interval={Math.max(1, Math.floor(chartData.length / 10))}
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => `€${v}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value) => [`€${Number(value).toFixed(2)}`, 'Share Price']}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.date ? formatDate(payload[0].payload.date) : ''}
                />
                <ReferenceLine y={stats.startPrice} stroke="#64748b" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="sharePrice" stroke="#4ade80" strokeWidth={2} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Normalized Chart */}
        {(view === 'normalized' || view === 'both') && (
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-4">
            <h2 className="text-sm font-medium mb-3 text-slate-300">Performance vs CCI30 (100 = startdatum)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="#64748b" 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  interval={Math.max(1, Math.floor(chartData.length / 10))}
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => `${v.toFixed(0)}%`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.date ? formatDate(payload[0].payload.date) : ''}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <ReferenceLine y={100} stroke="#64748b" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="priceNorm" name="A-DAM Capital" stroke="#4ade80" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cci30Norm" name="CCI30 Index" stroke="#f97316" strokeWidth={2} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly NAV Table */}
        {showTable && (
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-4">
            <h2 className="text-sm font-medium mb-3 text-slate-300">📋 Officiële NAV per Maand (Prijs per Participatie)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-2 text-slate-400 font-medium">Jaar</th>
                    {MONTH_NAMES.map((m, i) => (
                      <th key={i} className="text-right py-2 px-1 text-slate-400 font-medium">{m}</th>
                    ))}
                    <th className="text-right py-2 px-2 text-slate-400 font-medium">Jaar %</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(navByYear).sort().map(year => {
                    const yearData = navByYear[year];
                    const firstMonth = Object.keys(yearData).sort((a,b) => Number(a)-Number(b))[0];
                    const lastMonth = Object.keys(yearData).sort((a,b) => Number(b)-Number(a))[0];
                    const startVal = year === '2022' ? 1000 : (navByYear[String(parseInt(year)-1)]?.[11]?.price || yearData[Number(firstMonth)]?.price);
                    const endVal = yearData[Number(lastMonth)]?.price || startVal;
                    const yearReturn = ((endVal - startVal) / startVal) * 100;

                    return (
                      <tr key={year} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-2 px-2 font-medium text-white">{year}</td>
                        {MONTH_NAMES.map((_, i) => {
                          const item = yearData[i];
                          if (!item) return <td key={i} className="text-right py-2 px-1 text-slate-600">-</td>;

                          // Calculate month change
                          let prevPrice;
                          if (i === 0) {
                            prevPrice = year === '2022' ? 1000 : navByYear[String(parseInt(year)-1)]?.[11]?.price;
                          } else {
                            prevPrice = yearData[i-1]?.price;
                          }
                          const change = prevPrice ? ((item.price - prevPrice) / prevPrice) * 100 : 0;

                          return (
                            <td key={i} className="text-right py-2 px-1">
                              <div className="text-white">€{item.price.toFixed(0)}</div>
                              <div className={`text-xs ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                              </div>
                            </td>
                          );
                        })}
                        <td className={`text-right py-2 px-2 font-bold ${yearReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {yearReturn >= 0 ? '+' : ''}{yearReturn.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-slate-500 text-xs mt-2">* Startprijs maart 2022: €1.000 | Januari 2026 is MTD (month-to-date)</p>
          </div>
        )}

        <p className="text-slate-600 text-xs text-center mt-4">
          Bron: historic_nav + adam-nav-api • CCI30: cci30.com
        </p>
      </div>
    </div>
  );
}
