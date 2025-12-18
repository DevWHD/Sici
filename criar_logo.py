#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from PIL import Image, ImageDraw, ImageFont
import os

# Criar imagem com as dimensões corretas (baseada na logo que você enviou)
# 400x133 pixels é um bom tamanho para a logo
img = Image.new('RGB', (400, 133), color='black')
draw = ImageDraw.Draw(img)

# Tentar usar fonte disponível
try:
    # Fonte para "PREFEITURA"
    font_small = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 14)
    font_big = ImageFont.truetype("C:\\Windows\\Fonts\\ariblk.ttf", 80)
except:
    font_small = ImageFont.load_default()
    font_big = ImageFont.load_default()

# Desenhar "PREFEITURA" no topo
try:
    draw.text((55, 8), "PREFEITURA", fill='white', font=font_small)
except:
    draw.text((55, 8), "PREFEITURA", fill='white')

# Desenhar "RIO" grande (simples, já que não temos a fonte exata)
try:
    draw.text((70, 35), "RIO", fill='white', font=font_big)
except:
    draw.text((70, 35), "RIO", fill='white')

# Salvar imagem
img.save('logo.png')
print("✓ Logo criada em: logo.png")
