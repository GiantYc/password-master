document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const passwordResult = document.getElementById('passwordResult');
  const copyButton = document.getElementById('copyButton');
  const generateButton = document.getElementById('generateButton');
  const passwordLength = document.getElementById('passwordLength');
  const lengthValue = document.getElementById('lengthValue');
  const includeUppercase = document.getElementById('includeUppercase');
  const includeLowercase = document.getElementById('includeLowercase');
  const includeNumbers = document.getElementById('includeNumbers');
  const includeSymbols = document.getElementById('includeSymbols');
  const strengthBar = document.getElementById('strengthBar');
  const strengthText = document.getElementById('strengthText');
  const themeToggle = document.getElementById('themeToggle');
  const passwordHistory = document.getElementById('passwordHistory');
  const clearHistoryButton = document.getElementById('clearHistoryButton');

  // 字符集
  const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
  const NUMBER_CHARS = '0123456789';
  const SYMBOL_CHARS = '!@#$%^&*()-_=+[]{}|;:,.<>?/';

  // 历史记录数组
  let passwordHistoryArray = JSON.parse(localStorage.getItem('passwordHistory')) || [];

  // 初始化
  updateLengthValue();
  updatePasswordHistory();
  updateThemeIcon();
  generatePassword();

  // 事件监听器
  passwordLength.addEventListener('input', updateLengthValue);
  generateButton.addEventListener('click', generatePassword);
  copyButton.addEventListener('click', copyPasswordToClipboard);
  themeToggle.addEventListener('click', toggleTheme);
  clearHistoryButton.addEventListener('click', clearHistory);

  // 复选框事件监听
  [includeUppercase, includeLowercase, includeNumbers, includeSymbols].forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      // 确保至少选中一个选项
      if (!includeUppercase.checked && !includeLowercase.checked && 
          !includeNumbers.checked && !includeSymbols.checked) {
        this.checked = true;
      }
      generatePassword();
    });
  });

  // 更新密码长度显示
  function updateLengthValue() {
    lengthValue.textContent = passwordLength.value;
    generatePassword();
  }

  // 生成密码
  function generatePassword() {
    let charset = '';
    
    if (includeUppercase.checked) charset += UPPERCASE_CHARS;
    if (includeLowercase.checked) charset += LOWERCASE_CHARS;
    if (includeNumbers.checked) charset += NUMBER_CHARS;
    if (includeSymbols.checked) charset += SYMBOL_CHARS;

    // 确保有字符可用
    if (charset === '') {
      includeUppercase.checked = true;
      charset = UPPERCASE_CHARS;
    }

    let password = '';
    const length = parseInt(passwordLength.value);

    // 使用加密安全的随机数生成密码
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(randomValues[i] % charset.length);
    }

    // 显示密码
    passwordResult.textContent = password;
    
    // 评估密码强度
    evaluatePasswordStrength(password);
    
    // 添加到历史记录
    addToHistory(password);
  }

  // 评估密码强度
  function evaluatePasswordStrength(password) {
    // 密码强度评分标准
    let score = 0;
    const length = password.length;

    // 长度分数 (8-64)，最多25分
    score += Math.min(25, Math.floor(length * 0.5));

    // 字符种类分数
    if (/[A-Z]/.test(password)) score += 10; // 大写字母
    if (/[a-z]/.test(password)) score += 10; // 小写字母
    if (/[0-9]/.test(password)) score += 10; // 数字
    if (/[^A-Za-z0-9]/.test(password)) score += 15; // 特殊字符

    // 额外复杂度分数
    const uniqueChars = new Set(password).size;
    score += Math.min(20, uniqueChars * 0.5); // 字符多样性，最多20分

    // 显示强度
    let strengthLevel, strengthColor;
    
    if (score < 40) {
      strengthLevel = '弱';
      strengthColor = 'var(--strength-weak)';
    } else if (score < 60) {
      strengthLevel = '中';
      strengthColor = 'var(--strength-medium)';
    } else if (score < 80) {
      strengthLevel = '强';
      strengthColor = 'var(--strength-strong)';
    } else {
      strengthLevel = '非常强';
      strengthColor = 'var(--strength-very-strong)';
    }

    // 更新UI
    strengthText.textContent = strengthLevel;
    strengthBar.style.width = `${score}%`;
    strengthBar.style.backgroundColor = strengthColor;
    
    // 添加动画效果
    strengthBar.style.transition = 'width 0.5s ease-in-out, background-color 0.5s ease-in-out';
    
    // 根据强度级别添加不同的类
    strengthBar.className = 'strength-bar';
    setTimeout(() => {
      strengthBar.classList.add(`strength-${strengthLevel}`);
      
      // 添加脉冲效果
      const pulseColor = strengthColor.replace('var(--strength-', '').replace(')', '');
      passwordResult.style.setProperty('--pulse-color', pulseColor);
      passwordResult.classList.add('pulse-effect');
      
      setTimeout(() => {
        passwordResult.classList.remove('pulse-effect');
      }, 1000);
    }, 100);
  }

  // 复制密码到剪贴板
  function copyPasswordToClipboard() {
    const password = passwordResult.textContent;
    
    if (password === '密码将显示在这里') return;
    
    navigator.clipboard.writeText(password)
      .then(() => {
        // 显示复制成功提示
        const originalIcon = copyButton.innerHTML;
        copyButton.innerHTML = '<i class="fas fa-check"></i>';
        copyButton.classList.add('copy-success');
        
        // 添加成功消息提示
        const successMessage = document.createElement('div');
        successMessage.className = 'copy-message';
        successMessage.textContent = '密码已复制到剪贴板';
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
          copyButton.innerHTML = originalIcon;
          copyButton.classList.remove('copy-success');
          successMessage.classList.add('fade-out');
          
          setTimeout(() => {
            document.body.removeChild(successMessage);
          }, 500);
        }, 1500);
      })
      .catch(err => {
        console.error('复制失败: ', err);
      });
  }

  // 切换主题
  function toggleTheme() {
    const body = document.body;
    const isDarkMode = body.classList.toggle('dark-theme');
    localStorage.setItem('darkTheme', isDarkMode);
    updateThemeIcon();
  }

  // 更新主题图标
  function updateThemeIcon() {
    const isDarkMode = document.body.classList.contains('dark-theme');
    themeToggle.innerHTML = isDarkMode ? 
      '<i class="fas fa-sun"></i>' : 
      '<i class="fas fa-moon"></i>';
  }

  // 检查保存的主题设置
  if (localStorage.getItem('darkTheme') === 'true') {
    document.body.classList.add('dark-theme');
    updateThemeIcon();
  }

  // 添加密码到历史记录
  function addToHistory(password) {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // 添加到数组的开头
    passwordHistoryArray.unshift({
      password: password,
      time: timeStr
    });
    
    // 限制历史记录数量为20
    if (passwordHistoryArray.length > 20) {
      passwordHistoryArray.pop();
    }
    
    // 保存到本地存储
    localStorage.setItem('passwordHistory', JSON.stringify(passwordHistoryArray));
    
    // 更新UI
    updatePasswordHistory();
  }

  // 更新历史记录UI
  function updatePasswordHistory() {
    // 清空历史记录显示
    passwordHistory.innerHTML = '';
    
    if (passwordHistoryArray.length === 0) {
      passwordHistory.innerHTML = '<div class="empty-history">没有历史记录</div>';
      return;
    }
    
    // 添加每一条历史记录
    passwordHistoryArray.forEach((item, index) => {
      // 添加延迟加载动画
      setTimeout(() => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item fade-in';
        
        const passwordSpan = document.createElement('div');
        passwordSpan.className = 'history-password';
        passwordSpan.textContent = item.password;
        
        const timeSpan = document.createElement('div');
        timeSpan.className = 'history-time';
        timeSpan.textContent = item.time;
        
        historyItem.appendChild(passwordSpan);
        historyItem.appendChild(timeSpan);
        
        // 点击历史记录项可以复制该密码
        historyItem.addEventListener('click', function() {
          passwordResult.textContent = item.password;
          evaluatePasswordStrength(item.password);
          copyPasswordToClipboard();
        });
        
        passwordHistory.appendChild(historyItem);
        
        // 淡入效果结束后移除类
        setTimeout(() => {
          historyItem.classList.remove('fade-in');
        }, 300);
      }, index * 50); // 每项延迟50ms
    });
  }

  // 清除历史记录
  function clearHistory() {
    passwordHistoryArray = [];
    localStorage.removeItem('passwordHistory');
    updatePasswordHistory();
  }
}); 