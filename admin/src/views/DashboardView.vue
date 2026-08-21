<template>
  <div>
    <!-- 页头 -->
    <div class="page-head">
      <div>
        <h1>工作台</h1>
      </div>
      <span class="head-note">{{ todayFormatted }}</span>
    </div>

    <!-- 今日概览 4 大指标卡片 -->
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-num">6</div>
        <div class="stat-label">本周新报名</div>
        <div class="stat-note">料理课 4 · 烘焙课 2</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">3</div>
        <div class="stat-label">进行中的课程</div>
        <div class="stat-note">最近一课在本周四</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">2</div>
        <div class="stat-label">近期活动</div>
        <div class="stat-note">初秋茶会 9 月 7 日</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">4</div>
        <div class="stat-label">待处理事项</div>
        <div class="stat-note">不着急，一件件来</div>
      </div>
    </div>

    <!-- 待处理 (系统替你记住的事) -->
    <div class="panel">
      <div class="panel-title">
        待处理<span class="title-note">系统替你记住的事</span>
      </div>
      <table class="table">
        <tbody>
          <tr>
            <td style="width:24px; color: var(--tea);">✦</td>
            <td>
              <div class="td-main">初秋茶会的报名将在 9 月 5 日截止</div>
              <div class="td-sub">目前已有 8 人报名，限 12 人</div>
            </td>
            <td style="width:120px; text-align:right;">
              <router-link class="btn-text" to="/activities">去看看</router-link>
            </td>
          </tr>
          <tr>
            <td style="color: var(--tea);">✦</td>
            <td>
              <div class="td-main">料理课第 3 课资料将于 9 月 17 日自动开放</div>
              <div class="td-sub">已设置定时开放，无需手动操作</div>
            </td>
            <td style="text-align:right;">
              <router-link class="btn-text" to="/courses">查看课程设置</router-link>
            </td>
          </tr>
          <tr>
            <td style="color: var(--tea);">✦</td>
            <td>
              <div class="td-main">有 2 位学员的打卡还没有回复</div>
              <div class="td-sub">阿玲 · 7 月 24 日 / 小满 · 7 月 23 日</div>
            </td>
            <td style="text-align:right;">
              <router-link class="btn-text" to="/checkins">回复打卡</router-link>
            </td>
          </tr>
          <tr>
            <td style="color: var(--tea);">✦</td>
            <td>
              <div class="td-main">1 笔退款申请待处理</div>
              <div class="td-sub">订单 20260718 · 插花活动</div>
            </td>
            <td style="text-align:right;">
              <router-link class="btn-text" to="/orders">处理</router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 进行中的课程 -->
    <div class="panel">
      <div class="panel-title">
        进行中的课程<span class="title-note"><router-link class="btn-text" to="/courses">全部课程</router-link></span>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>课程</th>
            <th>进度</th>
            <th>学员</th>
            <th>本周作业提交</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="id-cell">
                <div class="photo photo-food thumb"></div>
                <div>
                  <div class="td-main">生活料理 · 第 12 期</div>
                  <div class="td-sub">每周四晚 · 线上</div>
                </div>
              </div>
            </td>
            <td>第 2 / 8 课</td>
            <td class="num">32</td>
            <td><span class="tag green">21 份</span></td>
            <td style="text-align:right;">
              <router-link class="row-link" to="/courses">管理</router-link>
            </td>
          </tr>
          <tr>
            <td>
              <div class="id-cell">
                <div class="photo photo-space thumb"></div>
                <div>
                  <div class="td-main">空间管理 · 第 7 期</div>
                  <div class="td-sub">每周三晚 · 线上</div>
                </div>
              </div>
            </td>
            <td>第 4 / 6 课</td>
            <td class="num">28</td>
            <td><span class="tag green">19 份</span></td>
            <td style="text-align:right;">
              <router-link class="row-link" to="/courses">管理</router-link>
            </td>
          </tr>
          <tr>
            <td>
              <div class="id-cell">
                <div class="photo photo-baking thumb"></div>
                <div>
                  <div class="td-main">纯素烘焙 · 第 5 期</div>
                  <div class="td-sub">每周六上午 · 线上</div>
                </div>
              </div>
            </td>
            <td>第 1 / 6 课</td>
            <td class="num">24</td>
            <td><span class="tag">收集中</span></td>
            <td style="text-align:right;">
              <router-link class="row-link" to="/courses">管理</router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 最新报名 -->
    <div class="panel">
      <div class="panel-title">
        最新报名<span class="title-note"><router-link class="btn-text" to="/orders">全部订单</router-link></span>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>学员</th>
            <th>报名内容</th>
            <th>时间</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="id-cell">
                <span class="avatar">满</span>
                <div>
                  <div class="td-main">林小满</div>
                  <div class="td-sub">上海</div>
                </div>
              </div>
            </td>
            <td>生活料理 · 第 12 期</td>
            <td class="td-sub">今天 10:24</td>
            <td><span class="tag green">已支付</span></td>
          </tr>
          <tr>
            <td>
              <div class="id-cell">
                <span class="avatar">晴</span>
                <div>
                  <div class="td-main">苏晚晴</div>
                  <div class="td-sub">杭州</div>
                </div>
              </div>
            </td>
            <td>初秋茶会</td>
            <td class="td-sub">昨天 21:07</td>
            <td><span class="tag green">已支付</span></td>
          </tr>
          <tr>
            <td>
              <div class="id-cell">
                <span class="avatar">禾</span>
                <div>
                  <div class="td-main">陈禾禾</div>
                  <div class="td-sub">苏州</div>
                </div>
              </div>
            </td>
            <td>纯素烘焙 · 第 5 期</td>
            <td class="td-sub">昨天 16:42</td>
            <td><span class="tag green">已支付</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const todayFormatted = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekday = weekdays[now.getDay()];
  return `${year} 年 ${month} 月 ${day} 日 · ${weekday}`;
});
</script>
