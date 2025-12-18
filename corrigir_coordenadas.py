#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import random
from collections import defaultdict

# Mapa EXPANDIDO de bairros com coordenadas PRECISAS do Rio de Janeiro
BAIRRO_COORDS = {
    # Zona Sul - Praia
    'Copacabana': (-22.9829, -43.1863),
    'Ipanema': (-22.9868, -43.2037),
    'Leblon': (-23.0033, -43.2299),
    'Arpoador': (-22.9967, -43.2157),
    'Lagoa': (-22.9731, -43.2139),
    'Vidigal': (-23.0044, -43.2319),
    'Rocinha': (-23.0033, -43.2499),
    'Botafogo': (-22.9544, -43.1961),
    'Flamengo': (-22.9233, -43.1758),
    'Glória': (-22.9489, -43.1839),
    
    # Centro
    'Centro': (-22.9035, -43.1788),
    'Lapa': (-22.9141, -43.1854),
    'Santa Teresa': (-22.9161, -43.1606),
    'Catete': (-22.9326, -43.1825),
    'Santo Cristo': (-22.8922, -43.2089),
    'Saúde': (-22.8833, -43.1453),
    'Praça da Bandeira': (-22.8922, -43.2297),
    'Mangueira': (-22.8878, -43.2114),
    'Rio Comprido': (-22.9167, -43.2213),
    'Cidade Nova': (-22.9068, -43.1729),
    
    # Zona Norte
    'Ramos': (-22.8483, -43.2389),
    'Penha': (-22.8506, -43.2819),
    'Olaria': (-22.8461, -43.2736),
    'São Cristóvão': (-22.8867, -43.2267),
    'Benfica': (-22.8533, -43.2899),
    'Irajá': (-22.8397, -43.3919),
    'Vila da Penha': (-22.8489, -43.3856),
    'Madureira': (-22.8778, -43.3646),
    'Praça Seca': (-22.8911, -43.3975),
    'Oswaldo Cruz': (-22.8906, -43.3736),
    'Cavalcanti': (-22.8928, -43.3614),
    'Inhaúma': (-22.8544, -43.3386),
    'Pillar': (-22.8683, -43.1817),
    'Portuguesa': (-22.8261, -43.3167),
    'Cocotá': (-22.8283, -43.2667),
    'Pavuna': (-22.8072, -43.3839),
    'Jardim Guanabara': (-22.8167, -43.2333),
    
    # Zona Oeste
    'Barra da Tijuca': (-23.0052, -43.3682),
    'Jacarepaguá': (-22.9787, -43.3456),
    'Pechincha': (-22.9256, -43.4389),
    'Marechal Hermes': (-22.8749, -43.3445),
    'Andaraí': (-22.9149, -43.2699),
    'São Conrado': (-23.0167, -43.3089),
    
    # Ilhas
    'Paquetá': (-22.7667, -43.1253),
    'Cacuia': (-22.7833, -43.1607),
}

def adicionar_variacao(lat, lon, raio=0.005):
    """Adiciona pequena variação às coordenadas para distribuir marcadores"""
    variacao_lat = (random.random() - 0.5) * raio
    variacao_lon = (random.random() - 0.5) * raio
    return lat + variacao_lat, lon + variacao_lon

# Carregar JSON original
with open('sms_consolidado.json', 'r', encoding='utf-8') as f:
    dados_originais = json.load(f)

# Contar registros por bairro para debug
bairros_count = defaultdict(int)

# Transformar para array
dados_transformados = []

for chave_principal, item_data in dados_originais.items():
    chave_secundaria = list(item_data.keys())[0]
    dados = item_data[chave_secundaria]
    
    # Extrair informações
    endereco = dados.get('endereco', {})
    bairro = endereco.get('bairro', 'Cidade Nova')
    
    # Contar para debug
    bairros_count[bairro] += 1
    
    # Pegar coordenadas do bairro com variação
    if bairro in BAIRRO_COORDS:
        lat_base, lon_base = BAIRRO_COORDS[bairro]
        lat, lon = adicionar_variacao(lat_base, lon_base, raio=0.008)
    else:
        # Se bairro não encontrado, usar Centro com variação
        lat, lon = adicionar_variacao(-22.9035, -43.1788, raio=0.008)
        print(f"⚠ Bairro '{bairro}' não encontrado, usando Centro como padrão")
    
    # Pegar telefone (primeiro disponível)
    telefone = ''
    if 'comunicacoes' in dados and dados['comunicacoes']:
        for comm in dados['comunicacoes']:
            if comm.get('valor'):
                telefone = comm.get('valor', '')
                break
    
    # Pegar email (primeiro disponível)
    email = ''
    if 'comunicacoes' in dados and dados['comunicacoes']:
        for comm in dados['comunicacoes']:
            if 'mail' in comm.get('tipo', '').lower() or '@' in comm.get('valor', ''):
                email = comm.get('valor', '')
                break
    
    # Montar endereço completo
    endereco_completo = []
    if endereco.get('logradouro'):
        endereco_completo.append(endereco['logradouro'])
    if endereco.get('numero'):
        endereco_completo.append(endereco['numero'])
    if endereco.get('complemento'):
        endereco_completo.append(endereco['complemento'])
    if bairro:
        endereco_completo.append(bairro)
    if endereco.get('cep'):
        endereco_completo.append(endereco['cep'])
    
    endereco_str = ', '.join(endereco_completo)
    
    # Pegar titular e cargo
    geral = dados.get('geral', {})
    titular = geral.get('titular', 'N/A')
    cargo = geral.get('cargo', 'N/A')
    
    novo_item = {
        'nome': chave_principal,
        'latitude': round(lat, 6),
        'longitude': round(lon, 6),
        'titular': titular,
        'cargo': cargo,
        'endereco': endereco_str,
        'bairro': bairro,
        'telefone': telefone,
        'email': email,
        'timestamp': dados.get('timestamp', '')
    }
    
    dados_transformados.append(novo_item)

# Salvar JSON transformado
with open('dados.json', 'w', encoding='utf-8') as f:
    json.dump(dados_transformados, f, indent=2, ensure_ascii=False)

# Mostrar resumo
print(f"\n✓ {len(dados_transformados)} registros processados")
print(f"\nBairros encontrados ({len(bairros_count)} únicos):")
for bairro in sorted(bairros_count.keys()):
    count = bairros_count[bairro]
    print(f"  • {bairro}: {count} registros")
