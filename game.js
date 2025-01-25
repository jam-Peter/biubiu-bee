const gameContainer = document.getElementById('game-container');
const bee = document.getElementById('bee');
let isJumping = false;
let score = 0;
let gameSpeed = 2;
let gameStarted = false;
let gameTime = 60; // 60秒游戏时间
let timerInterval;

// 更新计时器显示
function updateTimer() {
  const timer = document.getElementById('timer');
  if (timer) {
    timer.textContent = `剩余时间：${gameTime}秒`;
    // 最后10秒变红色
    if (gameTime <= 10) {
      timer.style.color = '#ff0000';
      timer.style.textShadow = '0 0 10px #ff0000';
    }
  }
}

// 小蜜蜂跳跃
function jump() {
  const currentBottom = parseInt(bee.style.bottom) || 100;
  const newBottom = Math.min(currentBottom + 50, window.innerHeight - 100);
  bee.style.bottom = `${newBottom}px`;
  
  // 自动下降
  clearTimeout(bee.fallTimeout);
  bee.fallTimeout = setTimeout(() => {
    bee.style.bottom = '100px';
  }, 300);
}

// 创建花蜜
function createFlower() {
  const flower = document.createElement('div');
  flower.className = 'flower';
  // 花朵生成范围与蜜蜂飞行高度一致
  flower.style.top = `${Math.random() * (window.innerHeight - 150) + 50}px`;
  flower.style.right = '-50px';
  gameContainer.appendChild(flower);
  
  // 移动花蜜
  let flowerInterval = setInterval(() => {
    const right = parseInt(flower.style.right);
    flower.style.right = `${right + gameSpeed}px`;
    
    // 碰撞检测（保留原有功能）
    checkFlowerCollision(flower);
    
    // 如果磁铁激活，自动吸引
    if (magnetActive) {
      const beeRect = bee.getBoundingClientRect();
      const flowerRect = flower.getBoundingClientRect();
      const distance = Math.sqrt(
        Math.pow(flowerRect.left - beeRect.left, 2) +
        Math.pow(flowerRect.top - beeRect.top, 2)
      );
      
      if (distance <= window.innerWidth / 2) {
        const deltaX = beeRect.left - flowerRect.left;
        const deltaY = beeRect.top - flowerRect.top;
        flower.style.transition = 'all 0.5s linear';
        flower.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        
        setTimeout(() => {
          if (flower.parentNode) {
            flower.remove();
            score++;
            document.title = `得分：${score}`;
          }
        }, 500);
      }
    }
    
    // 移除屏幕外的花蜜
    if (right > window.innerWidth + 50) {
      flower.remove();
      clearInterval(flowerInterval);
    }
  }, 10);
}

// 创建磁铁
function createMagnet() {
  const magnet = document.createElement('div');
  magnet.className = 'magnet';
  magnet.style.top = `${Math.random() * (window.innerHeight - 150) + 50}px`;
  magnet.style.right = '-50px';
  gameContainer.appendChild(magnet);
  
  // 移动磁铁
  let magnetInterval = setInterval(() => {
    const right = parseInt(magnet.style.right);
    magnet.style.right = `${right + gameSpeed}px`;
    
    // 精确碰撞检测
    const beeRect = bee.getBoundingClientRect();
    const magnetRect = magnet.getBoundingClientRect();

    if (beeRect.right > magnetRect.left &&
        beeRect.left < magnetRect.right &&
        beeRect.bottom > magnetRect.top &&
        beeRect.top < magnetRect.bottom) {
      magnet.remove();
      clearInterval(magnetInterval);
      activateMagnet();
    }
    
    // 移除屏幕外的磁铁
    if (right > window.innerWidth + 50) {
      magnet.remove();
      clearInterval(magnetInterval);
    }
  }, 10);
}

let magnetActive = false;
let magnetTime = 0;

// 显示磁铁倒计时
function showMagnetTimer() {
  const magnetTimer = document.getElementById('magnet-timer');
  if (magnetTimer) {
    magnetTimer.textContent = `磁铁：${magnetTime}秒`;
    magnetTimer.style.color = magnetActive ? '#00ff00' : '#888';
  }
}

// 激活磁铁效果
function activateMagnet() {
  if (magnetActive) return;
  
  magnetActive = true;
  magnetTime = 5;
  showMagnetTimer();
  
  const beeRect = bee.getBoundingClientRect();
  const attractionRange = window.innerWidth / 2; // 半个屏幕范围
  
  // 磁铁倒计时
  const magnetInterval = setInterval(() => {
    magnetTime--;
    showMagnetTimer();
    
    if (magnetTime <= 0) {
      clearInterval(magnetInterval);
      magnetActive = false;
      showMagnetTimer();
    }
  }, 1000);
  
  // 自动吸引范围内的花朵
  document.querySelectorAll('.flower').forEach(flower => {
    const flowerRect = flower.getBoundingClientRect();
    const distance = Math.sqrt(
      Math.pow(flowerRect.left - beeRect.left, 2) +
      Math.pow(flowerRect.top - beeRect.top, 2)
    );
    
    if (distance <= attractionRange) {
      // 计算花朵飞向蜜蜂的路径
      const deltaX = beeRect.left - flowerRect.left;
      const deltaY = beeRect.top - flowerRect.top;
      
      // 添加飞行动画
      flower.style.transition = 'all 0.5s linear';
      flower.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      
      // 自动得分
      setTimeout(() => {
        if (flower.parentNode) {
          flower.remove();
          score++;
          document.title = `得分：${score}`;
        }
      }, 500);
    }
  });
}

// 花朵碰撞检测（保留原有功能）
function checkFlowerCollision(flower) {
  const beeRect = bee.getBoundingClientRect();
  const flowerRect = flower.getBoundingClientRect();
  
  if (beeRect.right > flowerRect.left &&
      beeRect.left < flowerRect.right &&
      beeRect.bottom > flowerRect.top &&
      beeRect.top < flowerRect.bottom) {
    flower.remove();
    score++;
    document.title = `得分：${score}`;
  }
}

// 创建障碍物
function createObstacle() {
  const obstacle = document.createElement('div');
  obstacle.className = 'obstacle';
  obstacle.style.right = '-200px';

  // 添加血条
  const healthContainer = document.createElement('div');
  healthContainer.style.position = 'absolute';
  healthContainer.style.top = '-30px';
  healthContainer.style.left = '0';
  
  // 血量数值显示
  const healthText = document.createElement('div');
  healthText.style.color = '#fff';
  healthText.style.fontSize = '12px';
  healthText.style.textAlign = 'center';
  healthText.style.textShadow = '1px 1px 2px #000';
  healthText.textContent = '100/100';
  healthContainer.appendChild(healthText);
  
  // 血条
  const healthBar = document.createElement('div');
  healthBar.style.width = '100px';
  healthBar.style.height = '10px';
  healthBar.style.backgroundColor = '#ff0000';
  healthBar.style.borderRadius = '5px';
  healthBar.style.marginTop = '2px';
  healthContainer.appendChild(healthBar);
  
  obstacle.health = 100;
  obstacle.appendChild(healthContainer);
  
  // 添加子弹发射功能
  const shootInterval = setInterval(() => {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    const obstacleRect = obstacle.getBoundingClientRect();
    bullet.style.left = `${obstacleRect.left}px`;
    bullet.style.top = `${obstacleRect.top + obstacleRect.height/2 - 10}px`;
    gameContainer.appendChild(bullet);
    
    // 移动子弹
    let bulletInterval = setInterval(() => {
      const left = parseInt(bullet.style.left);
      bullet.style.left = `${left - 5}px`;
      
      // 子弹与蜜蜂碰撞检测
      const beeRect = bee.getBoundingClientRect();
      const bulletRect = bullet.getBoundingClientRect();
      if (beeRect.right > bulletRect.left &&
          beeRect.left < bulletRect.right &&
          beeRect.bottom > bulletRect.top &&
          beeRect.top < bulletRect.bottom) {
        endGame();
      }
      
      // 子弹与激光碰撞检测
      document.querySelectorAll('.laser').forEach(laser => {
        const laserRect = laser.getBoundingClientRect();
        if (laserRect.right > bulletRect.left &&
            laserRect.left < bulletRect.right &&
            laserRect.bottom > bulletRect.top &&
            laserRect.top < bulletRect.bottom) {
          bullet.remove();
          clearInterval(bulletInterval);
        }
      });
      
      // 移除屏幕外的子弹
      if (left < -50) {
        bullet.remove();
        clearInterval(bulletInterval);
      }
    }, 10);
  }, 2000); // 每2秒发射一颗子弹
  
  // 清除子弹发射定时器
  obstacle.shootInterval = shootInterval;
  
  // 在蜜蜂飞行范围内生成障碍物
  const minY = 100; // 蜜蜂最低飞行高度
  const maxY = window.innerHeight - 150; // 蜜蜂最高飞行高度
  
  if (Math.random() < 0.5) {
    // 下方障碍物
    obstacle.style.bottom = `${Math.random() * (maxY - minY) + minY}px`;
  } else {
    // 上方障碍物
    obstacle.style.top = `${Math.random() * (maxY - minY) + minY}px`;
  }
  
  gameContainer.appendChild(obstacle);
  
  // 移动障碍物
  let obstacleInterval = setInterval(() => {
    const right = parseInt(obstacle.style.right);
    obstacle.style.right = `${right + gameSpeed}px`;
    
    // 精确碰撞检测
    const beeRect = bee.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();
    
    if (beeRect.right > obstacleRect.left &&
        beeRect.left < obstacleRect.right &&
        beeRect.bottom > obstacleRect.top &&
        beeRect.top < obstacleRect.bottom) {
      endGame();
    }
    
    // 移除屏幕外的障碍物
    if (right > window.innerWidth + 200) {
      obstacle.remove();
      clearInterval(obstacleInterval);
      clearInterval(obstacle.shootInterval);
    }
  }, 10);
}

// 初始化游戏
function startGame() {
  document.getElementById('start-message').style.display = 'none';
  
  // 创建计时器显示
  const timer = document.createElement('div');
  timer.id = 'timer';
  timer.style.position = 'absolute';
  timer.style.top = '20px';
  timer.style.right = '20px';
  timer.style.color = '#fff';
  timer.style.fontSize = '24px';
  timer.style.textShadow = '1px 1px 2px rgba(0,0,0,0.7)';
  gameContainer.appendChild(timer);

  // 创建磁铁计时器
  const magnetTimer = document.createElement('div');
  magnetTimer.id = 'magnet-timer';
  magnetTimer.style.position = 'absolute';
  magnetTimer.style.top = '20px';
  magnetTimer.style.left = '20px';
  magnetTimer.style.color = '#888';
  magnetTimer.style.fontSize = '24px';
  magnetTimer.style.textShadow = '1px 1px 2px rgba(0,0,0,0.7)';
  gameContainer.appendChild(magnetTimer);
  showMagnetTimer();
  
  setInterval(createObstacle, 2000);
  setInterval(createFlower, 1500);
  setInterval(createMagnet, 4500); // 磁铁生成频率为花朵的1/3
  
  // 启动计时器
  timerInterval = setInterval(() => {
    gameTime--;
    updateTimer();
    if (gameTime <= 0) {
      endGame();
    }
  }, 1000);
}

// 结束游戏
function endGame() {
  clearInterval(timerInterval);
  alert(`游戏结束！最终得分：${score}`);
  location.reload();
}

// 创建激光
function createLaser() {
  const laser = document.createElement('div');
  laser.className = 'laser';
  const beeRect = bee.getBoundingClientRect();
  
  // 设置激光位置和大小
  laser.style.width = `${window.innerWidth - beeRect.right}px`; // 从蜜蜂位置到屏幕右侧
  laser.style.height = `${beeRect.height}px`;
  laser.style.left = `${beeRect.right}px`;
  laser.style.top = `${beeRect.top}px`;
  
  gameContainer.appendChild(laser);
  
    // 激光与障碍物碰撞检测
    let laserInterval = setInterval(() => {
      const laserRect = laser.getBoundingClientRect();
      
      // 检测所有障碍物
      document.querySelectorAll('.obstacle').forEach(obstacle => {
        const obstacleRect = obstacle.getBoundingClientRect();
        
        if (laserRect.right > obstacleRect.left &&
            laserRect.left < obstacleRect.right &&
            laserRect.bottom > obstacleRect.top &&
            laserRect.top < obstacleRect.bottom) {
          // 每次激光击中减少5点生命值
          obstacle.health -= 5;
          
          // 更新血量显示
          const healthContainer = obstacle.querySelector('div');
          if (healthContainer) {
            const healthText = healthContainer.querySelector('div');
            const healthBar = healthText.nextElementSibling;
            
            // 更新血量数值
            healthText.textContent = `${obstacle.health}/100`;
            
            // 更新血条宽度
            healthBar.style.width = `${obstacle.health}px`;
            
            // 显示伤害数值
            const damageText = document.createElement('div');
            damageText.textContent = '-5';
            damageText.style.position = 'absolute';
            damageText.style.top = '-10px';
            damageText.style.left = '50%';
            damageText.style.color = '#ff0000';
            damageText.style.fontSize = '14px';
            damageText.style.fontWeight = 'bold';
            damageText.style.textShadow = '1px 1px 2px #000';
            damageText.style.transform = 'translateX(-50%)';
            healthContainer.appendChild(damageText);
            
            // 伤害数值动画
            setTimeout(() => {
              damageText.style.top = '-20px';
              damageText.style.opacity = '0';
              setTimeout(() => damageText.remove(), 500);
            }, 10);
          }
          
          // 生命值小于等于0时消灭障碍物
          if (obstacle.health <= 0) {
            obstacle.remove();
          }
        }
      });
    
    // 移除激光
    setTimeout(() => {
      laser.remove();
      clearInterval(laserInterval);
    }, 200); // 激光持续时间
  }, 10);
}

// 事件监听
document.addEventListener('click', () => {
  if (!gameStarted) {
    gameStarted = true;
    startGame();
  }
  jump();
});

// 添加空格键发射激光
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && gameStarted) {
    createLaser();
  }
});

// 逐渐增加难度
setInterval(() => {
  gameSpeed += 0.1;
}, 10000);
