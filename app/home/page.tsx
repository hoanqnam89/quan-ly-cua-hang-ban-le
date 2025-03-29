'use client';

import { ReactElement, useState, useEffect, useCallback, useRef } from "react";
import { ECollectionNames } from "@/enums";
import { getCollectionCount } from "@/services/api-service";
import Script from 'next/script';
import Image from 'next/image';

// Kiểu cho Google Charts
declare global {
  interface Window {
    google: {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      charts: any
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      visualization: any
    };
  }
}

interface IRevenueData {
  date: string;
  value: number;
}

interface ICustomerData {
  date: string;
  value: number;
}

interface IDateRangeType {
  startDate: string;
  endDate: string;
}

interface IStatCardData {
  title: string;
  value: number;
  icon: string;
  iconColor: string;
  iconBgColor: string;
}

export default function Home(): ReactElement {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalProductDetails, setTotalProductDetails] = useState<number>(0);
  const [totalEmployees, setTotalEmployees] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [revenueGrowth, setRevenueGrowth] = useState<number>(0);
  const [customerGrowth, setCustomerGrowth] = useState<number>(0);
  const [revenueData, setRevenueData] = useState<IRevenueData[]>([]);
  const [customerData, setCustomerData] = useState<ICustomerData[]>([]);
  const [dateRange, setDateRange] = useState<IDateRangeType>({
    startDate: '01/02/2023',
    endDate: '28/02/2023'
  });
  const [prevDateRange, setPrevDateRange] = useState<IDateRangeType>({
    startDate: '01/01/2023',
    endDate: '31/01/2023'
  });

  const [statsCards, setStatsCards] = useState<IStatCardData[]>([]);
  const isInitialized = useRef(false);

  // Hàm lấy số lượng từ collection
  const fetchCollectionCount = async (
    collectionName: ECollectionNames
  ): Promise<number> => {
    try {
      const response = await getCollectionCount(collectionName);
      const count = await response.json();
      console.log(`Số lượng ${collectionName}:`, count);
      return count;
    } catch (error) {
      console.error(`Lỗi khi lấy số lượng ${collectionName}:`, error);
      return 0;
    }
  };

  // Hàm lấy dữ liệu doanh thu theo thời gian
  // const fetchRevenueData = async (): Promise<void> => {
  //   try {
  //     const response = await fetch('/api/order-form/revenue-stats');
  //     if (response.ok) {
  //       const data = await response.json();

  //       setTotalRevenue(data.monthly || 0);

  //       const today = new Date();
  //       const sampleData: IRevenueData[] = [];
  //       for (let i = 0; i < 7; i++) {
  //         const date = new Date();
  //         date.setDate(today.getDate() - (6 - i));
  //         sampleData.push({
  //           date: `${date.getDate()}/${date.getMonth() + 1}`,
  //           value: Math.floor(Math.random() * 5000000) + 1000000
  //         });
  //       }
  //       setRevenueData(sampleData);

  //       setRevenueGrowth(((data.monthly - (data.monthly / 1.2)) / (data.monthly / 1.2)) * 100);
  //     } else {
  //       throw new Error('Lỗi khi lấy dữ liệu doanh thu theo thời gian');
  //     }
  //   } catch (error) {
  //     console.error('Lỗi khi lấy dữ liệu doanh thu theo thời gian:', error);
  //     // Dữ liệu mẫu doanh thu
  //     setRevenueData([
  //       { date: '01/02', value: 2500000 },
  //       { date: '05/02', value: 2500000 },
  //       { date: '09/02', value: 2500000 },
  //       { date: '13/02', value: 500000 },
  //       { date: '17/02', value: 5000000 },
  //       { date: '21/02', value: 7500000 },
  //       { date: '25/02', value: 1000000 },
  //     ]);
  //   }
  // };

  // Hàm lấy dữ liệu khách hàng theo thời gian
  // const fetchCustomerData = async (): Promise<void> => {
  //   try {
  //     const userCountResponse = await getCollectionCount(ECollectionNames.USER);
  //     const userCount = await userCountResponse.json();
  //     setTotalCustomers(userCount);
  //     const today = new Date();
  //     const sampleData: ICustomerData[] = [];
  //     for (let i = 0; i < 7; i++) {
  //       const date = new Date();
  //       date.setDate(today.getDate() - (6 - i));
  //       sampleData.push({
  //         date: `${date.getDate()}/${date.getMonth() + 1}`,
  //         value: Math.floor(Math.random() * 3)
  //       });
  //     }
  //     setCustomerData(sampleData);

  //     setCustomerGrowth(5);
  //   } catch (error) {
  //     console.error('Lỗi khi lấy dữ liệu khách hàng theo thời gian:', error);
  //     // Dữ liệu mẫu khách hàng nhân viênviên
  //     setCustomerData([
  //       { date: '01/02', value: 2 },
  //       { date: '05/02', value: 0 },
  //       { date: '09/02', value: 1 },
  //       { date: '13/02', value: 0 },
  //       { date: '17/02', value: 2 },
  //       { date: '21/02', value: 0 },
  //       { date: '25/02', value: 2 },
  //     ]);
  //   }
  // };

  // Hàm cập nhật các thẻ thống kê
  // const updateStatsCards = useCallback(() => {
  //   setStatsCards([
  //     {
  //       title: 'Tổng sản phẩm',
  //       value: totalProducts,
  //       icon: 'product',
  //       iconColor: 'text-pink-600',
  //       iconBgColor: 'bg-pink-100'
  //     },
  //     {
  //       title: 'Tổng nhân viên',
  //       value: totalEmployees,
  //       icon: 'employee',
  //       iconColor: 'text-indigo-600',
  //       iconBgColor: 'bg-indigo-100'
  //     },
  //     {
  //       title: 'Đơn hàng',
  //       value: totalOrders,
  //       icon: 'order',
  //       iconColor: 'text-blue-600',
  //       iconBgColor: 'bg-blue-100'
  //     },
  //     {
  //       title: 'Chi tiết sản phẩm',
  //       value: totalProductDetails,
  //       icon: 'product-detail',
  //       iconColor: 'text-amber-600',
  //       iconBgColor: 'bg-amber-100'
  //     }
  //   ]);
  // }, [totalProducts, totalEmployees, totalOrders, totalProductDetails]);

  // Hàm tổng hợp để lấy tất cả dữ liệu
  const fetchAllData = useCallback(async (startDate?: string, endDate?: string): Promise<void> => {
    setIsLoading(true);
    try {
      const [
        productCount,
        productDetailCount,
        employeeCount,
        orderCount
      ] = await Promise.all([
        fetchCollectionCount(ECollectionNames.PRODUCT),
        fetchCollectionCount(ECollectionNames.PRODUCT_DETAIL),
        fetchCollectionCount(ECollectionNames.USER),
        fetchCollectionCount(ECollectionNames.ORDER_FORM),
      ]);

      setTotalProducts(productCount);
      setTotalProductDetails(productDetailCount);
      setTotalEmployees(employeeCount);
      setTotalOrders(orderCount);

      console.log('Kết quả API đã lấy được:', {
        products: productCount,
        productDetails: productDetailCount,
        employees: employeeCount,
        orders: orderCount
      });


      if (startDate && endDate) {
        setDateRange({
          startDate,
          endDate
        });
      }

      // Dữ liệu mẫu còn lại, sử dụng trực tiếp giá trị API
      const calculatedRevenue = Math.max(orderCount * 500000, 1000000);
      setTotalRevenue(calculatedRevenue);
      setTotalCustomers(employeeCount);
      setRevenueGrowth(15.7);
      setCustomerGrowth(5.2);

      const currentStartDate = startDate || dateRange.startDate;
      const currentEndDate = endDate || dateRange.endDate;
      const startDateObj = parseDate(currentStartDate);
      const endDateObj = parseDate(currentEndDate);
      const dateArray = generateDatesBetween(startDateObj, endDateObj, 7);

      const newRevenueData: IRevenueData[] = [];

      const coefficients = generateRandomCoefficients(dateArray.length);

      dateArray.forEach((date, index) => {
        newRevenueData.push({
          date: `${date.getDate()}/${date.getMonth() + 1}`,
          value: Math.round(calculatedRevenue * coefficients[index])
        });
      });
      setRevenueData(newRevenueData);

      // Dữ liệu cho biểu đồ khách hàng - tính toán dựa trên số nhân viên thực
      const customerPerDay = Math.max(Math.ceil(employeeCount / dateArray.length), 1);
      const newCustomerData: ICustomerData[] = [];

      dateArray.forEach((date, index) => {
        const customerFactor = (Math.sin(index * 0.9) + 1) / 2 + 0.1;
        newCustomerData.push({
          date: `${date.getDate()}/${date.getMonth() + 1}`,
          value: Math.max(Math.round(customerPerDay * customerFactor), 0)
        });
      });
      setCustomerData(newCustomerData);

      setStatsCards([
        {
          title: 'Tổng sản phẩm',
          value: productCount,
          icon: 'product',
          iconColor: 'text-pink-600',
          iconBgColor: 'bg-pink-100'
        },
        {
          title: 'Tổng nhân viên',
          value: employeeCount,
          icon: 'employee',
          iconColor: 'text-indigo-600',
          iconBgColor: 'bg-indigo-100'
        },
        {
          title: 'Đơn hàng',
          value: orderCount,
          icon: 'order',
          iconColor: 'text-blue-600',
          iconBgColor: 'bg-blue-100'
        },
        {
          title: 'Chi tiết sản phẩm',
          value: productDetailCount,
          icon: 'product-detail',
          iconColor: 'text-amber-600',
          iconBgColor: 'bg-amber-100'
        }
      ]);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);

      // Dữ liệu mẫu nếu API bị lỗi
      setTotalProducts(120);
      setTotalEmployees(15);
      setTotalProductDetails(250);
      setTotalOrders(45);

      // Tính toán doanh thu dựa trên đơn hàng
      const sampleRevenue = 45 * 500000;
      setTotalRevenue(sampleRevenue);
      setTotalCustomers(15);
      setRevenueGrowth(15.7);
      setCustomerGrowth(5.2);

      const currentStartDate = startDate || dateRange.startDate;
      const currentEndDate = endDate || dateRange.endDate;
      const startDateObj = parseDate(currentStartDate);
      const endDateObj = parseDate(currentEndDate);
      const sampleDates = generateDatesBetween(startDateObj, endDateObj, 7);

      // Dữ liệu giả cho biểu đồ doanh thu và khách hàng theo khoảng thời gian
      const dailyCoefficients = generateRandomCoefficients(sampleDates.length);

      const newRevenueData: IRevenueData[] = [];
      const newCustomerData: ICustomerData[] = [];

      sampleDates.forEach((date, index) => {
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;

        // Doanh thu
        newRevenueData.push({
          date: formattedDate,
          value: Math.round(sampleRevenue * dailyCoefficients[index])
        });

        // Khách hàng
        newCustomerData.push({
          date: formattedDate,
          value: Math.floor(Math.random() * 3)
        });
      });

      setRevenueData(newRevenueData);
      setCustomerData(newCustomerData);

      setStatsCards([
        {
          title: 'Tổng sản phẩm',
          value: 120,
          icon: 'product',
          iconColor: 'text-pink-600',
          iconBgColor: 'bg-pink-100'
        },
        {
          title: 'Tổng nhân viên',
          value: 15,
          icon: 'employee',
          iconColor: 'text-indigo-600',
          iconBgColor: 'bg-indigo-100'
        },
        {
          title: 'Đơn hàng',
          value: 45,
          icon: 'order',
          iconColor: 'text-blue-600',
          iconBgColor: 'bg-blue-100'
        },
        {
          title: 'Chi tiết sản phẩm',
          value: 250,
          icon: 'product-detail',
          iconColor: 'text-amber-600',
          iconBgColor: 'bg-amber-100'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  // Hàm phân tích chuỗi ngày DD/MM/YYYY thành đối tượng Date
  const parseDate = (dateString: string): Date => {
    const [day, month, year] = dateString.split('/').map(part => parseInt(part, 10));
    return new Date(year, month - 1, day);
  };

  // Hàm tạo các điểm ngày đều đặn giữa hai ngày, với số lượng điểm cố định
  const generateDatesBetween = (startDate: Date, endDate: Date, pointCount: number): Date[] => {
    const result: Date[] = [];

    if (startDate.getTime() === endDate.getTime()) {
      for (let i = 0; i < pointCount; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() - (pointCount - i - 1));
        result.push(date);
      }
      return result;
    }

    const timeRange = endDate.getTime() - startDate.getTime();
    const interval = timeRange / (pointCount - 1);

    for (let i = 0; i < pointCount; i++) {
      const time = startDate.getTime() + i * interval;
      result.push(new Date(time));
    }

    return result;
  };

  // Hàm tạo các hệ số ngẫu nhiên có tổng bằng 1
  const generateRandomCoefficients = (count: number): number[] => {
    const randomNumbers: number[] = [];
    let sum = 0;

    for (let i = 0; i < count; i++) {
      const randomVal = 0.5 + Math.random();
      randomNumbers.push(randomVal);
      sum += randomVal;
    }

    // Chuẩn hóa để tổng bằng 1
    return randomNumbers.map(val => val / sum);
  };

  // Hàm để định dạng ngày thành chuỗi DD/MM/YYYY
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Hàm tạo các khoảng thời gian cho dropdown
  const generateDateRangeOptions = (): { label: string, value: string, startDate: string, endDate: string }[] => {
    const today = new Date();

    // Hôm nay
    const todayStr = formatDate(today);

    // 7 ngày qua
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 6);
    const last7DaysStr = formatDate(last7Days);

    // 30 ngày qua
    const last30Days = new Date(today);
    last30Days.setDate(today.getDate() - 29);
    const last30DaysStr = formatDate(last30Days);

    // Tháng này
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfMonthStr = formatDate(firstDayOfMonth);

    // Tháng trước
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    const firstDayOfLastMonthStr = formatDate(firstDayOfLastMonth);
    const lastDayOfLastMonthStr = formatDate(lastDayOfLastMonth);

    return [
      {
        label: 'Hôm nay',
        value: `${todayStr} - ${todayStr}`,
        startDate: todayStr,
        endDate: todayStr
      },
      {
        label: '7 ngày qua',
        value: `${last7DaysStr} - ${todayStr}`,
        startDate: last7DaysStr,
        endDate: todayStr
      },
      {
        label: '30 ngày qua',
        value: `${last30DaysStr} - ${todayStr}`,
        startDate: last30DaysStr,
        endDate: todayStr
      },
      {
        label: 'Tháng này',
        value: `${firstDayOfMonthStr} - ${todayStr}`,
        startDate: firstDayOfMonthStr,
        endDate: todayStr
      },
      {
        label: 'Tháng trước',
        value: `${firstDayOfLastMonthStr} - ${lastDayOfLastMonthStr}`,
        startDate: firstDayOfLastMonthStr,
        endDate: lastDayOfLastMonthStr
      }
    ];
  };

  // Hàm thay đổi khoảng thời gian
  const handleDateRangeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const dateOptions = generateDateRangeOptions();
    const selectedOption = dateOptions.find(option => option.value === selectedValue);

    if (selectedOption) {
      // Lưu khoảng thời gian hiện tại vào khoảng trước đó
      setPrevDateRange({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      // Gọi API để lấy dữ liệu mới với khoảng thời gian đã chọn
      fetchAllData(selectedOption.startDate, selectedOption.endDate);
    }
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [fetchAllData, dateRange]);

  // Khởi tạo ứng dụng
  useEffect(() => {
    if (!isInitialized.current) {
      const dateOptions = generateDateRangeOptions();
      const defaultOption = dateOptions[1]; // Mặc định chọn "7 ngày qua"

      // Cài đặt khoảng thời gian ban đầu
      setDateRange({
        startDate: defaultOption.startDate,
        endDate: defaultOption.endDate
      });

      setPrevDateRange({
        startDate: dateOptions[4].startDate, // Tháng trước
        endDate: dateOptions[4].endDate
      });

      // Đánh dấu đã khởi tạo
      isInitialized.current = true;

      // Gọi lấy dữ liệu ban đầu
      fetchAllData(defaultOption.startDate, defaultOption.endDate);
    }
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  // Tự động cập nhật dữ liệu
  useEffect(() => {
    // Cập nhật dữ liệu định kỳ mỗi phút
    const intervalId = setInterval(() => {
      console.log('Đang tự động cập nhật dữ liệu...');
      fetchAllData(dateRange.startDate, dateRange.endDate);
    }, 60 * 1000); // Cập nhật mỗi 1 phút để dễ kiểm tra

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchAllData, dateRange]);

  // Khởi tạo Google Charts
  useEffect(() => {
    // Hàm này sẽ được gọi khi Google Charts API được load xong
    const initGoogleCharts = () => {
      if (typeof window !== 'undefined' && window.google && window.google.charts) {
        // Load các gói biểu đồ
        window.google.charts.load('current', { 'packages': ['corechart'] });
        window.google.charts.setOnLoadCallback(drawCharts);
      }
    };

    // Vẽ các biểu đồ
    const drawCharts = () => {
      // Biểu đồ phân bổ doanh thu theo danh mục
      if (document.getElementById('revenue-pie-chart')) {
        // Tính toán phân bổ doanh thu dựa trên số lượng sản phẩm và chi tiết sản phẩm
        const productPercent = Math.min(40, totalProducts / (totalProducts + totalProductDetails) * 100);
        const productDetailPercent = Math.min(40, totalProductDetails / (totalProducts + totalProductDetails) * 100);
        const orderPercent = Math.min(30, totalOrders / (totalProducts + totalProductDetails) * 100);
        const otherPercent = 100 - productPercent - productDetailPercent - orderPercent;

        const revenueData = window.google.visualization.arrayToDataTable([
          ['Danh mục', 'Doanh thu'],
          ['Sản phẩm', Math.round(totalRevenue * productPercent / 100)],
          ['Chi tiết sản phẩm', Math.round(totalRevenue * productDetailPercent / 100)],
          ['Đơn hàng', Math.round(totalRevenue * orderPercent / 100)],
          ['Khác', Math.round(totalRevenue * otherPercent / 100)]
        ]);

        const revenueOptions = {
          title: 'Doanh thu theo danh mục',
          colors: ['#60a5fa', '#34d399', '#f97316', '#a855f7'],
          chartArea: { width: '100%', height: '80%' },
          legend: { position: 'bottom' },
          pieHole: 0.4,
        };

        const revenueChart = new window.google.visualization.PieChart(document.getElementById('revenue-pie-chart'));
        revenueChart.draw(revenueData, revenueOptions);
      }

      // Biểu đồ phân bổ khách hàng theo độ tuổi
      if (document.getElementById('customer-pie-chart')) {
        // Tính toán phân bổ khách hàng dựa trên số lượng nhân viên
        const customerTotal = totalEmployees || 5; // Dùng số nhân viên làm cơ sở

        const customerData = window.google.visualization.arrayToDataTable([
          ['Nhóm khách hàng', 'Số lượng'],
          ['Nhân viên', Math.round(customerTotal * 0.6)], // 60% là nhân viên
          ['Khách VIP', Math.round(customerTotal * 0.2)], // 20% là khách VIP
          ['Khách thường', Math.round(customerTotal * 0.15)], // 15% là khách thường
          ['Khác', Math.round(customerTotal * 0.05)]  // 5% khác
        ]);

        const customerOptions = {
          title: 'Phân loại người dùng',
          colors: ['#fbbf24', '#f97316', '#ec4899', '#8b5cf6'],
          chartArea: { width: '100%', height: '80%' },
          legend: { position: 'bottom' },
          pieHole: 0.4,
        };

        const customerChart = new window.google.visualization.PieChart(document.getElementById('customer-pie-chart'));
        customerChart.draw(customerData, customerOptions);
      }
    };

    // Gọi hàm khởi tạo
    if (typeof window !== 'undefined' && !isLoading) {
      if (window.google && window.google.charts) {
        initGoogleCharts();
      } else {
        // Thêm sự kiện listener để khởi tạo biểu đồ khi script được load
        window.addEventListener('google-charts-loaded', initGoogleCharts);
      }
    }

    // Cleanup listener
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('google-charts-loaded', initGoogleCharts);
      }
    };
  }, [isLoading, totalRevenue, totalCustomers, totalProducts, totalProductDetails, totalOrders, totalEmployees]);

  // Hàm format số tiền
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Hàm vẽ biểu đồ doanh thu
  const renderRevenueChart = () => {
    const maxValue = Math.max(...revenueData.map(item => item.value));
    const chartHeight = 200;

    return (
      <div className="relative h-[200px] w-full mt-4">
        {/* Trục Y - giá trị */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <div>{(maxValue / 1000000).toFixed(1)}M</div>
          <div>{(maxValue * 0.75 / 1000000).toFixed(1)}M</div>
          <div>{(maxValue * 0.5 / 1000000).toFixed(1)}M</div>
          <div>{(maxValue * 0.25 / 1000000).toFixed(1)}M</div>
          <div>0</div>
        </div>

        {/* Biểu đồ */}
        <div className="absolute left-8 right-0 top-0 h-full">
          <div className="relative h-full w-full">
            {/* Đường kẻ ngang */}
            <div className="absolute top-0 w-full border-t border-gray-200"></div>
            <div className="absolute top-1/4 w-full border-t border-gray-200"></div>
            <div className="absolute top-2/4 w-full border-t border-gray-200"></div>
            <div className="absolute top-3/4 w-full border-t border-gray-200"></div>
            <div className="absolute bottom-0 w-full border-t border-gray-200"></div>

            {/* Vẽ biểu đồ */}
            <div className="absolute inset-0 flex items-end">
              {revenueData.map((item, index) => {
                const heightPercent = (item.value / maxValue) * 100;
                const isFirst = index === 0;
                // const isLast = index === revenueData.length - 1;
                const width = 100 / (revenueData.length - 1);

                return (
                  <div
                    key={index}
                    className="relative h-full group"
                    style={{ width: `${width}%` }}
                  >
                    {/* Thanh biểu đồ */}
                    <div
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 bg-blue-500 rounded-t-lg transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${heightPercent}%` }}
                    >
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap transition-opacity duration-200">
                        {formatCurrency(item.value)}đ
                      </div>
                    </div>

                    {/* Đường nối các điểm */}
                    {!isFirst && (
                      <div
                        className="absolute bottom-0 right-1/2 w-full h-px bg-blue-500"
                        style={{
                          transform: `rotate(${Math.atan2(
                            (revenueData[index].value - revenueData[index - 1].value) / maxValue * chartHeight,
                            width
                          )}rad)`,
                          transformOrigin: 'right bottom',
                          width: `${width}%`
                        }}
                      ></div>
                    )}

                    {/* Nhãn trục X */}
                    <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                      {item.date}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Hàm vẽ biểu đồ khách hàng
  const renderCustomerChart = () => {
    const maxValue = Math.max(...customerData.map(item => item.value), 3);
    const chartHeight = 150;

    return (
      <div className="relative h-[150px] w-full mt-4">
        {/* Trục Y - giá trị */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <div>3</div>
          <div>2</div>
          <div>1</div>
          <div>0</div>
        </div>

        {/* Biểu đồ */}
        <div className="absolute left-8 right-0 top-0 h-full">
          <div className="relative h-full w-full">
            {/* Đường kẻ ngang */}
            <div className="absolute top-0 w-full border-t border-gray-200"></div>
            <div className="absolute top-1/3 w-full border-t border-gray-200"></div>
            <div className="absolute top-2/3 w-full border-t border-gray-200"></div>
            <div className="absolute bottom-0 w-full border-t border-gray-200"></div>

            {/* Vẽ biểu đồ */}
            <div className="absolute inset-0">
              {customerData.map((item, index) => {
                const heightPercent = (item.value / maxValue) * 100;
                const isFirst = index === 0;
                const width = 100 / (customerData.length - 1);

                return (
                  <div
                    key={index}
                    className="absolute bottom-0 group"
                    style={{
                      left: `${index * width}%`,
                      height: `${heightPercent}%`,
                      width: `${width}%`
                    }}
                  >
                    {/* Vùng màu dưới đường */}
                    {!isFirst && (
                      <div
                        className="absolute bottom-0 left-0 w-full bg-yellow-100 opacity-40"
                        style={{
                          height: `${heightPercent}%`
                        }}
                      ></div>
                    )}

                    {/* Điểm dữ liệu */}
                    <div
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-yellow-500 rounded-full transition-all duration-300 hover:bg-yellow-600 hover:scale-110"
                      style={{ bottom: `${heightPercent}%` }}
                    >
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap transition-opacity duration-200">
                        {item.value} khách
                      </div>
                    </div>

                    {/* Đường nối các điểm */}
                    {!isFirst && (
                      <div
                        className="absolute bottom-0 right-1/2 w-full h-px bg-yellow-500"
                        style={{
                          transform: `rotate(${Math.atan2(
                            (customerData[index].value - customerData[index - 1].value) / maxValue * chartHeight,
                            width
                          )}rad)`,
                          transformOrigin: 'right bottom',
                          width: `${width}%`
                        }}
                      ></div>
                    )}

                    {/* Nhãn trục X */}
                    <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                      {item.date}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Phần hiển thị loading
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-slate-700 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://www.gstatic.com/charts/loader.js"
        onLoad={() => {
          window.dispatchEvent(new Event('google-charts-loaded'));
        }}
      />

      <div className="p-6 bg-gray-50">
        {/* Tiêu đề và bộ lọc */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Tổng quan báo cáo</h1>

          <div className="mt-3 md:mt-0 flex items-center">
            <div className="relative inline-block">
              <select
                className="appearance-none border border-gray-200 rounded-lg py-2.5 px-6 pr-12 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 min-w-[200px]"
                onChange={handleDateRangeChange}
                defaultValue={`${dateRange.startDate} - ${dateRange.endDate}`}
              >
                {generateDateRangeOptions().map((option, index) => (
                  <option key={index} value={option.value} className="py-2 text-gray-700">
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-blue-600">
                <Image
                  src="/icons/chevron-down.svg"
                  alt="Chọn khoảng thời gian"
                  width={20}
                  height={20}
                  priority
                  style={{ filter: 'brightness(0) saturate(100%) invert(37%) sepia(98%) saturate(1234%) hue-rotate(206deg) brightness(97%) contrast(101%)' }}
                />
              </div>
            </div>

            <button className="ml-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-lg py-2.5 px-6 text-sm font-medium flex items-center shadow-md hover:shadow-lg transition-all duration-200">
              <Image
                src="/icons/plus.svg"
                alt="Thêm báo cáo"
                width={20}
                height={20}
                className="mr-2"
                priority
              />
              Thêm báo cáo
            </button>
          </div>
        </div>

        {/* Các thẻ thống kê bổ sung */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-100 p-6 flex items-center shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className={`p-3 rounded-xl mr-4 ${card.iconBgColor}`}>
                <Image
                  src={`/icons/${card.icon}.svg`}
                  alt={card.title}
                  width={28}
                  height={28}
                  priority
                  style={{
                    filter: card.iconColor === 'text-pink-600' ? 'brightness(0) saturate(100%) invert(32%) sepia(98%) saturate(1234%) hue-rotate(330deg) brightness(97%) contrast(101%)' :
                      card.iconColor === 'text-indigo-600' ? 'brightness(0) saturate(100%) invert(37%) sepia(98%) saturate(1234%) hue-rotate(206deg) brightness(97%) contrast(101%)' :
                        card.iconColor === 'text-blue-600' ? 'brightness(0) saturate(100%) invert(37%) sepia(98%) saturate(1234%) hue-rotate(206deg) brightness(97%) contrast(101%)' :
                          'brightness(0) saturate(100%) invert(37%) sepia(98%) saturate(1234%) hue-rotate(206deg) brightness(97%) contrast(101%)'
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-xl font-bold text-gray-800 mt-1">
                  {card.title.includes('Doanh thu') ? formatCurrency(card.value) + 'đ' : formatCurrency(card.value)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Khung thống kê chính */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {/* Khung doanh thu */}
          <div className="border border-gray-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 bg-white overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
              <h2 className="font-semibold text-gray-700 uppercase text-sm">TỔNG DOANH THU</h2>
              <div className="flex items-center mt-3">
                <span className="text-blue-700 text-2xl font-bold">{formatCurrency(totalRevenue)}Đ</span>
                <span className="ml-4 text-green-600 flex items-center bg-green-50 px-3 py-1.5 rounded-full text-sm font-medium">
                  <Image
                    src="/icons/arrow-up.svg"
                    alt="Tăng trưởng"
                    width={16}
                    height={16}
                    className="mr-1"
                    priority
                  />
                  {revenueGrowth.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Doanh thu theo thời gian</h3>
              <div className="bg-blue-50 p-5 rounded-lg">
                {renderRevenueChart()}
              </div>

              <div className="flex justify-center mt-6 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center mr-6">
                  <span className="block w-4 h-1 bg-blue-600 mr-2 rounded-full"></span>
                  <span className="font-medium">{dateRange.startDate} - {dateRange.endDate}</span>
                </div>
                <div className="flex items-center">
                  <span className="block w-4 h-1 border-b border-blue-600 border-dashed mr-2"></span>
                  <span>{prevDateRange.startDate} - {prevDateRange.endDate}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-white to-blue-50">
              <div id="revenue-pie-chart" className="h-64 w-full"></div>
            </div>
          </div>

          {/* Khung khách hàng */}
          <div className="border border-gray-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 bg-white overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-yellow-100">
              <h2 className="font-semibold text-gray-700 uppercase text-sm">TỔNG KHÁCH HÀNG</h2>
              <div className="flex items-center mt-3">
                <span className="text-yellow-700 text-2xl font-bold">{totalCustomers}</span>
                <span className="ml-4 text-green-600 flex items-center bg-green-50 px-3 py-1.5 rounded-full text-sm font-medium">
                  <Image
                    src="/icons/arrow-up.svg"
                    alt="Tăng trưởng"
                    width={16}
                    height={16}
                    className="mr-1"
                    priority
                  />
                  {customerGrowth.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Khách hàng theo thời gian</h3>

              <div className="bg-white rounded-lg p-4 mb-4 border border-gray-100 shadow-sm">
                <div className="flex flex-wrap text-sm">
                  <div className="flex items-center mr-6 mb-1">
                    <span className="inline-block w-3 h-3 bg-yellow-600 mr-2 rounded-full"></span>
                    <span className="font-medium text-gray-700">{dateRange.startDate} - {dateRange.endDate}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 border border-yellow-600 mr-2"></span>
                    <span className="text-gray-600">{prevDateRange.startDate} - {prevDateRange.endDate}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-5 rounded-lg">
                {renderCustomerChart()}
              </div>

              <div className="flex justify-center mt-6 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center mr-6">
                  <span className="block w-4 h-1 bg-yellow-600 mr-2 rounded-full"></span>
                  <span className="font-medium">{dateRange.startDate} - {dateRange.endDate}</span>
                </div>
                <div className="flex items-center">
                  <span className="block w-4 h-1 border-b border-yellow-600 border-dashed mr-2"></span>
                  <span>{prevDateRange.startDate} - {prevDateRange.endDate}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-white to-yellow-50">
              <div id="customer-pie-chart" className="h-64 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
