import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getSalesData = async (req, res) => {
  try {
    const analyticsData = await getAnalyticsData();

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dailySalesData = await getDailySalesData(startDate, endDate);

    res.status(200).json({
      analyticsData,
      dailySalesData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};
export const getAnalyticsData = async () => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();

  // aggregate is a method in mongoose that allows us to perform operations on the data like sum, average, etc
  const salesData = await Order.aggregate([
    {
      // $group will group the data based on the field we provide
      // and we can get data from $group by using the $ sign before the field name like $totalAmount
      $group: {
        _id: null, // this is the default value to group all the data together
        totalSales: { $sum: 1 }, // this will count the total number of sales
        totalRavenue: { $sum: "$totalAmount" }, // this will sum the total amount of all the sales
      },
    },
  ]);
  // we can destructure the data from the salesData array
  const { totalSales, totalRavenue } = salesData[0] || {
    totalSales: 0,
    totalRavenue: 0,
  };

  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRavenue,
  };
};

export const getDailySalesData = async (startDate, endDate) => {
  try {
    const dailySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            // $gte is greater than or equal to
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        // $dateToString is used to convert the date to a string
        // group the data based on the date and get the total sales and revenue
        // why we group data ? because we want to get the total sales and revenue for each day
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    //    console.log(dailySalesData) then we get the data like this
    // example of dailySalesData
    // [
    // 	{
    // 		_id: "2024-08-18",
    // 		sales: 12,
    // 		revenue: 1450.75
    // 	},
    // ]

    const dateArray = getDatesInRange(startDate, endDate);
    // console.log(dateArray) // ['2024-10-14', '2024-10-15', ... upto endDate]

    return dateArray?.map((date) => {
      const foundData = dailySalesData.find((item) => item._id === date);

      return {
        date,
        sales: foundData?.sales || 0,
        revenue: foundData?.revenue || 0,
      };
    });
  } catch (error) {
    throw error;
  }
};

function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}