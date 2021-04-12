const titleFn = (symbol = 'BTCUSDT') => (
  {
    text: (symbol === 'BTCUSDT'
        ? 'BTC/USD'
        : symbol === 'BTCBRL'
            ? 'BTC/BRL'
            : 'USD/BRL') + ' Price',
    align: 'left'
  }
)

export const optionsCandlesTick = (symbol = 'BTCUSDT')=> ({
    grid: {
        show: false,
    },
    title: titleFn(symbol),
    chart: {
        type: 'candlestick',
        zoom: {
            type: 'x',
            enabled: false,
            autoScaleYaxis: true
          },
    },
    xaxis: {
        type: 'datetime'
    },
    yaxis: {
        enabled: true,
        tooltip: {
            enabled: true
        }
    },
  })

export const optionsLinesTick = (symbol = 'BTCUSDT')=> ({
    grid: {
      show: false,
    },
    title: titleFn(symbol),
    chart: {
      type: 'area',
      stacked: false,
      //height: 350,
      zoom: {
        type: 'x',
        enabled: false,
        autoScaleYaxis: true
      },
      toolbar: {
        autoSelected: 'zoom'
      }
    },
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 0,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.3,
        opacityTo: 0,
        stops: [0, 90, 100]
      },
    },
    yaxis: {
      labels: {
        show: false
      },
      tooltip: {
        enabled: true
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        show: true,
      },
    },
    tooltip: {
      shared: false,
      y: {
        formatter: function (val) {
          return (val).toFixed(2)
        }
      },
      x: {
        formatter: function (val) {
          return new Date(val).toISOString()
          .replace(/T/, ' ')      // replace T with a space
          .replace(/\..+/, '')
        }
      }
    }
  })
