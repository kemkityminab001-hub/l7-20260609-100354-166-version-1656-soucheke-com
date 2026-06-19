高清剧集大全静态站点

生成内容：
- 首页：index.html
- 分类总览页：categories.html
- 独立分类页：10 个
- 排行榜页：ranking.html
- 搜索页：search.html
- 影片详情页：1980 个
- 样式文件：assets/styles.css
- 交互脚本：assets/app.js

说明：
1. 所有主要影片标题、简介、分类、标签、年份等内容已直接写入 HTML。
2. 每个 HTML 页面都插入了用户指定的 ads-widget.js 和百度统计代码。
3. 播放器逻辑使用 HLS，播放源从上传的原 JS 文件中提取，共提取 150 条 m3u8 地址，并按影片顺序循环绑定到详情页。
4. 上传包中没有 1.jpg 到 150.jpg 图片文件，因此页面按要求引用顶级目录下的 1.jpg 到 150.jpg，方便后续直接补齐封面图。
5. 不要删除 detail 目录，否则详情页链接会失效。
