import json

# Mapa expandido de coordenadas de bairros (latitude, longitude)
bairro_coords = {
    'Cidade Nova': (-22.9068, -43.1729),
    'Barra da Tijuca': (-23.0052, -43.3682),
    'Centro': (-22.9035, -43.1788),
    'Cacuia': (-22.7833, -43.1607),
    'Leblon': (-23.0033, -43.2299),
    'Andaraí': (-22.9149, -43.2699),
    'Marechal Hermes': (-22.8749, -43.3445),
    'Jacarepaguá': (-22.9787, -43.3456),
    'Benfica': (-22.8533, -43.2899),
    'Jardim Guanabara': (-22.8167, -43.2333),
    'Pechincha': (-22.9256, -43.4389),
    'São Conrado': (-23.0167, -43.3089),
    'Rocinha': (-23.0033, -43.2499),
    'Rio Comprido': (-22.9167, -43.2213),
    'Glória': (-22.9489, -43.1839),
    'Lapa': (-22.9141, -43.1854),
    'Santo Cristo': (-22.8922, -43.2089),
    'São Cristóvão': (-22.8867, -43.2267),
    'Saúde': (-22.8833, -43.1453),
    'Botafogo': (-22.9544, -43.1961),
    'Ipanema': (-22.9827, -43.2033),
    'Copacabana': (-22.9711, -43.1851),
    'Flamengo': (-22.9233, -43.1758),
    'Catete': (-22.9326, -43.1825),
    'Lagoa': (-22.9731, -43.2139),
    'Santa Teresa': (-22.9161, -43.1606),
    'Paquetá': (-22.7667, -43.1253),
    'Irajá': (-22.8397, -43.3919),
    'Vila da Penha': (-22.8489, -43.3856),
    'Madureira': (-22.8778, -43.3646),
    'Praça Seca': (-22.8911, -43.3975),
    'Oswaldo Cruz': (-22.8906, -43.3736),
    'Cavalcanti': (-22.8928, -43.3614),
    'Ramos': (-22.8483, -43.2389),
    'Penha': (-22.8506, -43.2819),
    'Olaria': (-22.8461, -43.2736),
    'Portuguesa': (-22.8261, -43.3167),
    'Cocotá': (-22.8283, -43.2667),
    'Pavuna': (-22.8072, -43.3839),
    'Inhaúma': (-22.8544, -43.3386),
    'Complexo da Penha': (-22.8508, -43.2889),
    'Pilar': (-22.8683, -43.1817),
    'Praça da Bandeira': (-22.8922, -43.2297),
    'Mangueira': (-22.8878, -43.2114),
    'São João': (-22.8828, -43.1911),
    'Tijuca': (-22.9378, -43.2378),
    'Vila Isabel': (-22.9267, -43.2511),
    'Grajaú': (-22.9578, -43.2578),
    'Higienópolis': (-22.9178, -43.2678),
    'Méier': (-22.8678, -43.2878),
    'Maracanã': (-22.8978, -43.2778),
    'Del Castilho': (-22.8578, -43.2978),
    'Engenho Novo': (-22.8878, -43.2578),
    'Abolição': (-22.8278, -43.2778),
    'Jacaré': (-22.8478, -43.2578),
    'Acari': (-22.8078, -43.3178),
    'Brás de Pina': (-22.8278, -43.3278),
    'Cordovil': (-22.8378, -43.3478),
    'Costa Barros': (-22.8678, -43.3178),
    'Engenharia': (-22.8178, -43.3578),
    'Encantado': (-22.8478, -43.3278),
    'Manguinhos': (-22.8578, -43.2578),
    'Piedade': (-22.8378, -43.3078),
    'Pilares': (-22.8178, -43.3078),
    'Rocha': (-22.8878, -43.3178),
    'Sampaio': (-22.8778, -43.3078),
    'Vaz Lobo': (-22.8278, -43.3678),
    'Vilar do Conde': (-22.9178, -43.3178),
    'Vila Valqueire': (-22.9278, -43.3578),
    'Taquara': (-22.9578, -43.3778),
    'Tanque': (-22.9378, -43.3678),
    'Camorim': (-23.0178, -43.3978),
    'Curicica': (-23.0078, -43.3878),
    'Recreio dos Bandeirantes': (-23.0278, -43.3578),
    'Guaratiba': (-23.0478, -43.5078),
    'Paciência': (-23.0378, -43.4978),
    'Senador Vasconcelos': (-23.0178, -43.4678),
}

# Carregar JSON original
with open('sms_consolidado.json', 'r', encoding='utf-8') as f:
    dados_originais = json.load(f)

# Transformar para array
dados_transformados = []

for chave_principal, item_data in dados_originais.items():
    chave_secundaria = list(item_data.keys())[0]
    dados = item_data[chave_secundaria]
    
    # Extrair informações
    endereco = dados.get('endereco', {})
    bairro = endereco.get('bairro', 'Cidade Nova')
    
    # Pegar coordenadas do bairro
    if bairro in bairro_coords:
        lat, lon = bairro_coords[bairro]
    else:
        lat, lon = -22.9068, -43.1729  # padrão
    
    # Pegar telefone
    telefone = ''
    if 'comunicacoes' in dados and dados['comunicacoes']:
        for comm in dados['comunicacoes']:
            if comm.get('valor'):
                telefone = comm.get('valor', '')
                break
    
    # Pegar email
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
        'latitude': lat,
        'longitude': lon,
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

print(f'✓ {len(dados_transformados)} registros processados com coordenadas corrigidas')
