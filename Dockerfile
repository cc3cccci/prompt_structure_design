# 使用 Node.js 镜像作为构建阶段
FROM node:20-alpine as build

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制所有源代码
COPY . .

# 构建生产环境代码
RUN npm run build

# 使用 Nginx 镜像作为生产环境阶段
FROM nginx:alpine

# 复制构建好的静态文件到 Nginx 的默认目录
COPY --from=build /app/dist /usr/share/nginx/html

# 复制自定义 Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
