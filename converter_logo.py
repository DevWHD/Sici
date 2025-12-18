#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import base64
import os

# Procurar por arquivo de imagem temporário do navegador
# Geralmente o VS Code salva attachments em um diretório temporário

# Para esta solução, vamos criar a tag HTML com src em base64
# Você precisa fornecer o caminho da imagem

# Alternativa: usar a imagem como URL externa ou salvar manualmente
# Por enquanto, vamos criar um placeholder que será substituído

print("Para usar a logo real:")
print("1. Salve a imagem em: c:\\Users\\Whendel\\Documents\\Sici\\logo.png")
print("2. Execute este script")

# Se o arquivo existir, converter para base64
if os.path.exists('logo.png'):
    with open('logo.png', 'rb') as f:
        image_data = base64.b64encode(f.read()).decode('utf-8')
    
    html_img = f'<img src="data:image/png;base64,{image_data}" alt="Prefeitura do Rio" id="sidebar-logo" />'
    
    with open('logo_base64.html', 'w', encoding='utf-8') as f:
        f.write(html_img)
    
    print("✓ Logo convertida para base64")
    print("✓ Arquivo salvo em: logo_base64.html")
else:
    print("✗ Arquivo logo.png não encontrado")
