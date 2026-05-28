import { targetActualMetricNames } from './calculations'

export const portfolioMetricSelectColumns = 'id, fiscal_year, asset_class, metric, amount'

export const mapSupabasePortfolioMetricsToTargetsActuals = (
  records,
  fiscalYears,
  assetClasses
) =>
  fiscalYears.flatMap((fiscalYear) =>
    assetClasses.map((assetClass) => {
      const row = {
        id: `${fiscalYear}-${assetClass}`,
        fiscalYear,
        assetClass,
      }

      targetActualMetricNames.forEach((metricName) => {
        const record = records.find(
          (metric) =>
            metric.fiscal_year === fiscalYear &&
            metric.asset_class === assetClass &&
            metric.metric === metricName
        )
        row[metricName] = Number(record?.amount || 0)
      })

      return row
    })
  )
