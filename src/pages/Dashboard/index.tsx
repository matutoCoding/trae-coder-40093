import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { LayoutDashboard, TrendingUp, Users, AlertTriangle, Clock, PhoneIncoming, Store } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useDashboardStore } from '@/store/dashboardStore';
import dayjs from 'dayjs';

function Dashboard() {
  const stats = useDashboardStore((s) => s.stats);
  const today = dayjs();

  const barOption = useMemo(() => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: stats.storeCompletionRates.map((s) => s.storeName.replace('大药房|旗舰店|中心店|科技园店|西湖店|锦江店', '').slice(0, 6)),
      axisLabel: { color: '#64748b', fontSize: 11, rotate: 0 },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { color: '#64748b', formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    series: [
      {
        type: 'bar',
        barWidth: 28,
        data: stats.storeCompletionRates.map((s) => ({
          value: s.rate,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: s.rate >= 80 ? '#2E8B57' : s.rate >= 60 ? '#E67E22' : '#E74C3C',
          },
        })),
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          color: '#475569',
          fontSize: 11,
          fontWeight: 600,
        },
      },
    ],
  }), [stats.storeCompletionRates]);

  const pieOption = useMemo(() => ({
    tooltip: { trigger: 'item', formatter: '{b}: {c}例 ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#475569', fontSize: 12 } },
    color: ['#E74C3C', '#1E5FA8', '#E67E22', '#94a3b8'],
    series: [
      {
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 3 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
        },
        data: stats.exceptionDistribution.length > 0
          ? stats.exceptionDistribution.map((e) => ({ name: e.type, value: e.count }))
          : [{ name: '暂无数据', value: 1 }],
      },
    ],
  }), [stats.exceptionDistribution]);

  const lineOption = useMemo(() => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['任务数', '完成数'], right: 10, top: 0, textStyle: { color: '#475569', fontSize: 12 } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '18%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: stats.dailyTrend.map((d) => dayjs(d.date).format('MM-DD')),
      axisLabel: { color: '#64748b', fontSize: 11 },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#64748b' },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    series: [
      {
        name: '任务数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: '#1E5FA8' },
        itemStyle: { color: '#1E5FA8', borderWidth: 2, borderColor: '#fff' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(30,95,168,0.2)' }, { offset: 1, color: 'rgba(30,95,168,0)' }],
          },
        },
        data: stats.dailyTrend.map((d) => d.tasks),
      },
      {
        name: '完成数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: '#2E8B57' },
        itemStyle: { color: '#2E8B57', borderWidth: 2, borderColor: '#fff' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(46,139,87,0.2)' }, { offset: 1, color: 'rgba(46,139,87,0)' }],
          },
        },
        data: stats.dailyTrend.map((d) => d.completed),
      },
    ],
  }), [stats.dailyTrend]);

  const categoryOption = useMemo(() => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#64748b' },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    yAxis: {
      type: 'category',
      data: stats.drugCategoryDistribution.map((d) => d.category).reverse(),
      axisLabel: { color: '#475569', fontSize: 11 },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
    },
    series: [
      {
        type: 'bar',
        barWidth: 18,
        data: stats.drugCategoryDistribution.map((d) => d.count).reverse().map((v, i, arr) => ({
          value: v,
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            color: [
              '#1E5FA8', '#2E8B57', '#E67E22', '#9333ea', '#db2777', '#0891b2', '#65a30d',
            ][(arr.length - 1 - i) % 7],
          },
        })),
        label: {
          show: true,
          position: 'right',
          formatter: '{c}人',
          color: '#475569',
          fontSize: 11,
          fontWeight: 600,
        },
      },
    ],
  }), [stats.drugCategoryDistribution]);

  const statCards = [
    {
      label: '今日回访任务',
      value: stats.totalTasks,
      sub: `已完成 ${stats.completedTasks} 个`,
      gradient: 'from-medical-500 via-medical-600 to-medical-700',
      icon: PhoneIncoming,
      trend: '+12% 环比',
    },
    {
      label: '整体完成率',
      value: `${stats.completionRate}%`,
      sub: stats.completionRate >= 80 ? '完成情况良好' : '需加大回访力度',
      gradient: 'from-trust-500 via-trust-600 to-trust-700',
      icon: TrendingUp,
      trend: stats.completionRate >= 80 ? '↑ 达标' : '↓ 待提升',
    },
    {
      label: '停药风险预警',
      value: stats.selfDiscontinuedCount,
      sub: '已推送药师跟进',
      gradient: 'from-danger-400 via-danger-500 to-danger-600',
      icon: AlertTriangle,
      trend: '重点关注',
    },
    {
      label: '待药师处理',
      value: stats.pendingPharmacistTasks,
      sub: '专业问题跟进中',
      gradient: 'from-warn-400 via-warn-500 to-warn-600',
      icon: Users,
      trend: `${Math.round(stats.averageCallDuration / 60)}分钟/通`,
    },
  ];

  return (
    <div>
      <PageHeader
        title="总部数据看板"
        subtitle={`${today.format('YYYY年MM月DD日')} 全部门店会员回访运营总览`}
        icon={<LayoutDashboard className="w-6 h-6 text-white" />}
        stats={[
          { label: '合作门店', value: '6', color: 'text-medical-600' },
          { label: '服务会员', value: '3,428', color: 'text-trust-600' },
          { label: '在岗药师', value: '12', color: 'text-warn-600' },
          { label: '客服坐席', value: '8', color: 'text-slate-600' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {statCards.map((s, i) => (
          <div key={i} className={`stat-card bg-gradient-to-br ${s.gradient} shadow-lg`}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/3"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="text-xs opacity-80 bg-white/15 px-2 py-1 rounded-md">{s.trend}</span>
              </div>
              <div className="text-xs opacity-85 mb-1">{s.label}</div>
              <div className="text-3xl font-bold tracking-tight mb-1">{s.value}</div>
              <div className="text-xs opacity-75 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {s.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Store className="w-4 h-4 text-medical-500" />
                各门店回访完成率
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">绿色达标 · 橙色需关注 · 红色预警</p>
            </div>
            <span className="text-xs text-slate-400">截至今日 18:00</span>
          </div>
          <ReactECharts option={barOption} style={{ height: 280 }} notMerge />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-danger-500" />
                异常类型分布
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">回访异常问题构成分析</p>
            </div>
          </div>
          <ReactECharts option={pieOption} style={{ height: 280 }} notMerge />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-trust-500" />
                近7日回访趋势
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">任务量与完成量逐日变化</p>
            </div>
          </div>
          <ReactECharts option={lineOption} style={{ height: 280 }} notMerge />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-warn-500" />
                药品类别分布
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">待回访患者用药类别</p>
            </div>
          </div>
          <ReactECharts option={categoryOption} style={{ height: 280 }} notMerge />
        </div>
      </div>

      <div className="mt-6 card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">门店完成率明细</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">门店名称</th>
                <th className="table-th text-center">店长</th>
                <th className="table-th text-right">任务数</th>
                <th className="table-th text-right">已完成</th>
                <th className="table-th">完成率</th>
                <th className="table-th text-center">状态</th>
              </tr>
            </thead>
            <tbody>
              {stats.storeCompletionRates.map((s, i) => (
                <tr key={s.storeId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="table-td font-medium">{s.storeName}</td>
                  <td className="table-td text-center text-slate-500">
                    {['王建国', '李淑芬', '陈志明', '林晓红', '张伟华', '赵丽娟'][i]}
                  </td>
                  <td className="table-td text-right font-mono">{s.total}</td>
                  <td className="table-td text-right font-mono">{s.completed}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[160px] h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            s.rate >= 80 ? 'bg-trust-500' : s.rate >= 60 ? 'bg-warn-500' : 'bg-danger-500'
                          }`}
                          style={{ width: `${s.rate}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-mono font-bold w-14 text-right ${
                        s.rate >= 80 ? 'text-trust-600' : s.rate >= 60 ? 'text-warn-600' : 'text-danger-600'
                      }`}>
                        {s.rate}%
                      </span>
                    </div>
                  </td>
                  <td className="table-td text-center">
                    <span className={`badge border ${
                      s.rate >= 80
                        ? 'bg-trust-50 text-trust-700 border-trust-200'
                        : s.rate >= 60
                        ? 'bg-warn-50 text-warn-700 border-warn-200'
                        : 'bg-danger-50 text-danger-700 border-danger-200'
                    }`}>
                      {s.rate >= 80 ? '达标' : s.rate >= 60 ? '待提升' : '预警'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
