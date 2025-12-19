require(["esri/Map", "esri/views/MapView", "esri/layers/GeoJSONLayer", "esri/Graphic", "esri/symbols/SimpleMarkerSymbol", "esri/geometry/Point"], 
  function(Map, MapView, GeoJSONLayer, Graphic, SimpleMarkerSymbol, Point) {

  console.log('✓ Script carregado!');

  // Elementos da sidebar
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebarOpenBtn = document.getElementById("sidebar-open-btn");
  const toggleUnitsBtn = document.getElementById("toggle-units");
  const unitsSection = document.getElementById("units-section");
  const toggleGbpBtn = document.getElementById("toggle-gbp");
  const gbpSection = document.getElementById("gbp-section");
  const themeToggle = document.getElementById("theme-toggle");
  const sidebarLogo = document.getElementById("sidebar-logo");

  // Tema claro/escuro
  let isDarkMode = true;

  function setTheme(isDark) {
    isDarkMode = isDark;
    
    // Aplicar fade out
    sidebarLogo.style.opacity = '0';
    
    setTimeout(() => {
      if (isDark) {
        sidebar.classList.remove("light-mode");
        sidebarLogo.src = "logo%20prefeitura.png";
      } else {
        sidebar.classList.add("light-mode");
        sidebarLogo.src = "logo%20da%20prefeitura%20white.png";
      }
      localStorage.setItem("theme", isDark ? "dark" : "light");
      
      // Aplicar fade in
      sidebarLogo.style.opacity = '1';
    }, 250);
  }

  // Carregar tema salvo ou usar padrão (escuro)
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    setTheme(false);
  } else {
    // Garantir modo escuro por padrão
    setTheme(true);
  }

  themeToggle.addEventListener("click", function(e) {
    e.stopPropagation();
    setTheme(!isDarkMode);
  });

  // Controlar toggle de unidades
  // Botão inicia com "+" já que a seção começa fechada
  toggleUnitsBtn.textContent = "+";
  
  toggleUnitsBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    const isHidden = unitsSection.style.display === "none";
    unitsSection.style.display = isHidden ? "block" : "none";
    toggleUnitsBtn.textContent = isHidden ? "−" : "+";
  });

  // Controlar toggle de GBP
  toggleGbpBtn.textContent = "+";
  
  toggleGbpBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    const isHidden = gbpSection.style.display === "none";
    gbpSection.style.display = isHidden ? "block" : "none";
    toggleGbpBtn.textContent = isHidden ? "−" : "+";
  });
  
  // Clique no SMS para ir ao marcador
  const smsButton = document.querySelector('.sms-button');
  if (smsButton) {
    smsButton.addEventListener('click', function(e) {
      // Se clicou no botão +, não fazer nada (deixar para toggleUnitsBtn)
      if (e.target.closest('#toggle-units')) return;
      
      // Encontrar e focar no marcador SMS
      const smsMarker = SMS_MARKERS.find(marker => marker.attributes && marker.attributes.nome === "SMS");
      if (smsMarker) {
        view.goTo({
          target: smsMarker.geometry,
          zoom: 16,
          duration: 1500,
          easing: "ease-in-out"
        }).then(() => {
          // Encontrar o dado SMS para mostrar no painel
          if (ALL_ORGANS_DATA) {
            const smsData = ALL_ORGANS_DATA.find(o => o.nome === "SMS");
            if (smsData) {
              showInfoPanel(smsData);
            }
          }
        }).catch((error) => {
          console.warn('Animação SMS interrompida:', error);
          if (ALL_ORGANS_DATA) {
            const smsData = ALL_ORGANS_DATA.find(o => o.nome === "SMS");
            if (smsData) {
              showInfoPanel(smsData);
            }
          }
        });
      }
    });
  }

  // Clique no PCRJ para ir ao marcador
  const pcrjButton = document.querySelector('.pcrj-button');
  if (pcrjButton) {
    pcrjButton.addEventListener('click', function(e) {
      // Encontrar e focar no marcador PCRJ
      const pcrjMarker = PCRJ_MARKERS.find(marker => marker.attributes && marker.attributes.tipo === "pcrj");
      if (pcrjMarker) {
        view.goTo({
          target: pcrjMarker.geometry,
          zoom: 16,
          duration: 1500,
          easing: "ease-in-out"
        }).then(() => {
          // Mostrar informações do PCRJ
          if (ALL_PCRJ_DATA) {
            showInfoPanel(ALL_PCRJ_DATA);
          }
        }).catch((error) => {
          console.warn('Animação PCRJ interrompida:', error);
          if (ALL_PCRJ_DATA) {
            showInfoPanel(ALL_PCRJ_DATA);
          }
        });
      }
    });
  }

  // Clique no GBP para ir ao marcador
  const gbpButton = document.querySelector('.gbp-button');
  if (gbpButton) {
    gbpButton.addEventListener('click', function(e) {
      // Se clicou no botão +, não fazer nada (deixar para toggleGbpBtn)
      if (e.target.closest('#toggle-gbp')) return;
      
      // Encontrar e focar no marcador GBP principal (raiz)
      const gbpMarker = GBP_MARKERS.find(marker => marker.attributes && marker.attributes.nome === "GBP");
      if (gbpMarker) {
        view.goTo({
          target: gbpMarker.geometry,
          zoom: 16,
          duration: 1500,
          easing: "ease-in-out"
        }).then(() => {
          // Mostrar informações do GBP
          if (ALL_GBP_DATA) {
            showInfoPanel(ALL_GBP_DATA);
          }
        }).catch((error) => {
          console.warn('Animação GBP interrompida:', error);
          if (ALL_GBP_DATA) {
            showInfoPanel(ALL_GBP_DATA);
          }
        });
      }
    });
  }

  // Controlar sidebar
  sidebarToggle.addEventListener("click", function() {
    sidebar.classList.add("hidden");
    sidebarOpenBtn.classList.add("visible");
  });

  sidebarOpenBtn.addEventListener("click", function() {
    sidebar.classList.remove("hidden");
    sidebarOpenBtn.classList.remove("visible");
  });

  // Criar mapa
  const map = new Map({
    basemap: "topo-vector"
  });

  console.log('✓ Mapa criado');

  // Criar view
  const view = new MapView({
    container: "map",
    map: map,
    center: [-43.2, -22.85],
    zoom: 11
  });

  console.log('✓ View criado');

  const infoPanel = document.getElementById("info-panel");
  const infoPanelContent = document.getElementById("panel-content");
  const closePanel = document.getElementById("close-panel");

  const SMS_MARKERS = [];
  const GBP_MARKERS = [];
  const PCRJ_MARKERS = [];
  let ALL_ORGANS_DATA = []; // Store all organs data
  let ALL_GBP_DATA = []; // Store all GBP data
  let ALL_PCRJ_DATA = []; // Store all PCRJ data

  // Close panel button
  closePanel.addEventListener("click", function() {
    infoPanel.classList.remove("active");
  });

  // Carregar camada do contorno do Rio de Janeiro
  function loadRioStateLayer() {
    console.log('Carregando contorno do Rio de Janeiro...');

    const geoJsonUrl = "https://pgeo3.rio.rj.gov.br/arcgis/rest/services/Cartografia/Limites_administrativos/MapServer/0/query?outFields=*&where=1%3D1&f=geojson";

    const rioLayer = new GeoJSONLayer({
      url: geoJsonUrl,
      title: "Estado do Rio de Janeiro",
      renderer: {
        type: "simple",
        symbol: {
          type: "simple-fill",
          color: [255, 255, 255, 0],
          outline: {
            color: [0, 51, 153],
            width: 2.5
          }
        }
      }
    });

    map.add(rioLayer);
    console.log('✓ Contorno do Rio de Janeiro carregado');
  }

  // Carregar marcadores SMS
  function loadSMSMarkers() {
    console.log('Carregando marcadores SMS...');

    fetch('dados.json')
      .then(response => response.json())
      .then(data => {
        ALL_ORGANS_DATA = data; // Store for sidebar list
        console.log(`✓ ${data.length} locais SMS carregados`);
        
        data.forEach((location, index) => {
          addSMSMarker(location);
        });
        
        // Load organs list in sidebar
        loadOrgaosList(data);
        
        console.log(`✓ Total de ${SMS_MARKERS.length} marcadores SMS adicionados ao mapa`);
      })
      .catch(error => console.error('✗ Erro ao carregar SMS:', error));
  }

  // Carregar lista de órgãos na sidebar
  function loadOrgaosList(orgaosData) {
    const orgaosList = document.getElementById("orgaos-list");
    const orgaosCount = document.getElementById("orgaos-count");
    const searchInput = document.getElementById("orgao-search");

    // Filtrar SMS das outras unidades
    const smsUnit = orgaosData.find(o => o.nome === "SMS");
    const otherUnits = orgaosData.filter(o => o.nome !== "SMS");
    
    // Atualizar contagem com o número de unidades (sem SMS)
    orgaosCount.textContent = otherUnits.length;

    function renderOrgaos(filteredData) {
      orgaosList.innerHTML = '';
      filteredData.forEach((orgao, index) => {
        const item = document.createElement('div');
        item.className = 'orgao-item';
        item.innerHTML = `
          <div class="orgao-item-nome">${orgao.nome}</div>
          <div class="orgao-item-bairro">📍 ${orgao.bairro}</div>
          ${orgao.titular ? `<div class="orgao-item-bairro" style="color: #999; font-size: 10px; margin-top: 4px;">👤 ${orgao.titular}</div>` : ''}
        `;
        
        item.addEventListener('click', function() {
          // Find the exact marker for this organ
          const matchingMarker = SMS_MARKERS.find(marker => 
            marker.attributes && marker.attributes.nome === orgao.nome
          );

          let targetGeometry = null;

          if (matchingMarker && matchingMarker.geometry) {
            targetGeometry = matchingMarker.geometry;
          } else if (orgao.longitude && orgao.latitude) {
            targetGeometry = {
              type: "point",
              x: orgao.longitude,
              y: orgao.latitude
            };
          }

          if (targetGeometry) {
            // Zoom to target with animation
            view.goTo({
              target: targetGeometry,
              zoom: 16,
              duration: 1500,
              easing: "ease-in-out"
            }).then(() => {
              // Animation completed successfully
              showInfoPanel(orgao);
            }).catch((error) => {
              // If animation fails, show panel anyway
              console.warn('Animação interrompida:', error);
              showInfoPanel(orgao);
            });
          } else {
            // Se não tiver coordenadas, mostrar apenas o painel
            showInfoPanel(orgao);
          }
          
          // Close sidebar on mobile
          if (window.innerWidth < 768) {
            sidebar.classList.add("hidden");
            sidebarOpenBtn.classList.add("visible");
          }
        });
        
        orgaosList.appendChild(item);
      });
    }

    // Initial render (sem SMS)
    renderOrgaos(otherUnits);

    // Search functionality
    searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase().trim();
      
      if (!query) {
        renderOrgaos(otherUnits);
        return;
      }

      const filtered = otherUnits.filter(orgao => 
        orgao.nome.toLowerCase().includes(query) ||
        orgao.bairro.toLowerCase().includes(query) ||
        (orgao.titular && orgao.titular.toLowerCase().includes(query))
      );

      renderOrgaos(filtered);
    });
    
    // Adicionar SMS ao topo da sidebar para clicar
    if (smsUnit) {
      const smsButton = document.querySelector('.sidebar-section:has(h3:contains("SMS"))');
      if (!smsButton) {
        // Adicionar clique no SMS se necessário
        const smsSection = document.querySelector('h3');
        if (smsSection && smsSection.textContent.includes('SMS')) {
          smsSection.parentElement.style.cursor = 'pointer';
          smsSection.parentElement.addEventListener('click', function() {
            // Zoom to SMS marker
            const smsMarker = SMS_MARKERS.find(marker => marker.attributes.nome === "SMS");
            if (smsMarker) {
              view.goTo({
                target: smsMarker.geometry,
                zoom: 16
              });
              setTimeout(() => {
                showInfoPanel(smsUnit);
              }, 500);
            }
          });
        }
      }
    }
  }

  // Carregar lista de órgãos GBP na sidebar
  function loadGBPList(gbpData, coordsData) {
    const gbpList = document.getElementById("gbp-list");
    const gbpCount = document.getElementById("gbp-count");
    const gbpSearch = document.getElementById("gbp-search");
    
    // Extrair órgãos do JSON - raiz + filhos
    const gbpOrgaos = [];
    let gbpRaiz = null;
    
    // Adicionar raiz como órgão principal
    if (gbpData.raiz) {
      const nomePlainText = gbpData.raiz.titulo ? gbpData.raiz.titulo.replace(/\n/g, ' ').trim() : (gbpData.raiz.geral?.cargo || "Gabinete do Prefeito");
      const coordsInfo = coordsData ? coordsData[nomePlainText] : null;
      
      const raizData = {
        nome: "GBP",
        titular: gbpData.raiz.geral?.titular,
        cargo: gbpData.raiz.geral?.cargo,
        telefone: gbpData.raiz.comunicacoes?.find(c => c.tipo.includes("Telefone"))?.valor,
        email: gbpData.raiz.comunicacoes?.find(c => c.tipo.includes("E-mail"))?.valor,
        endereco: `${gbpData.raiz.endereco?.logradouro}, ${gbpData.raiz.endereco?.numero}${gbpData.raiz.endereco?.complemento ? ' - ' + gbpData.raiz.endereco?.complemento : ''}`,
        bairro: gbpData.raiz.endereco?.bairro,
        latitude: coordsInfo?.latitude || -22.9101587,
        longitude: coordsInfo?.longitude || -43.2033722,
        tipo: 'gbp'
      };
      gbpRaiz = raizData;
      addGBPMarker(raizData);
    }
    
    // Adicionar filhos (sem o GBP raiz na lista)
    if (gbpData.filhos && Array.isArray(gbpData.filhos)) {
      gbpData.filhos.forEach(filho => {
        const coordsInfo = coordsData ? coordsData[filho.nome] : null;
        
        const filhoData = {
          nome: filho.nome.replace(/_/g, ' '),
          titular: filho.info?.geral?.titular,
          cargo: filho.info?.geral?.cargo,
          telefone: filho.info?.comunicacoes?.find(c => c.tipo.includes("Telefone"))?.valor,
          email: filho.info?.comunicacoes?.find(c => c.tipo.includes("E-mail"))?.valor,
          endereco: `${filho.info?.endereco?.logradouro}, ${filho.info?.endereco?.numero}${filho.info?.endereco?.complemento ? ' - ' + filho.info?.endereco?.complemento : ''}`,
          bairro: coordsInfo?.bairro || filho.info?.endereco?.bairro,
          latitude: coordsInfo?.latitude || -22.9101587,
          longitude: coordsInfo?.longitude || -43.2033722,
          tipo: 'gbp'
        };
        gbpOrgaos.push(filhoData);
        addGBPMarker(filhoData);
      });
    }
    
    // Guardar dados raiz para usar ao clicar no header
    ALL_GBP_DATA = gbpRaiz;
    
    // Atualizar contagem com apenas os filhos (sem GBP)
    gbpCount.textContent = gbpOrgaos.length;

    function renderGBP(filteredData) {
      gbpList.innerHTML = '';
      filteredData.forEach((orgao) => {
        const item = document.createElement('div');
        item.className = 'orgao-item';
        item.innerHTML = `
          <div class="orgao-item-nome">${orgao.nome}</div>
          <div class="orgao-item-bairro">📍 ${orgao.bairro}</div>
          ${orgao.titular ? `<div class="orgao-item-bairro" style="color: #999; font-size: 10px; margin-top: 4px;">👤 ${orgao.titular}</div>` : ''}
        `;
        
        item.addEventListener('click', function() {
          // Zoom to GBP marker with animation
          const gbpMarker = GBP_MARKERS.find(marker => 
            marker.attributes && marker.attributes.nome === orgao.nome
          );
          
          if (gbpMarker) {
            view.goTo({
              target: gbpMarker.geometry,
              zoom: 16,
              duration: 1500,
              easing: "ease-in-out"
            }).then(() => {
              showInfoPanel(orgao);
            }).catch((error) => {
              console.warn('Animação GBP interrompida:', error);
              showInfoPanel(orgao);
            });
          } else {
            showInfoPanel(orgao);
          }
          
          // Close sidebar on mobile
          if (window.innerWidth < 768) {
            sidebar.classList.add("hidden");
            sidebarOpenBtn.classList.add("visible");
          }
        });
        
        gbpList.appendChild(item);
      });
    }

    // Initial render
    renderGBP(gbpOrgaos);

    // Search functionality
    gbpSearch.addEventListener('input', function() {
      const query = this.value.toLowerCase().trim();
      
      if (!query) {
        renderGBP(gbpOrgaos);
        return;
      }

      const filtered = gbpOrgaos.filter(orgao => 
        orgao.nome.toLowerCase().includes(query) ||
        (orgao.titular && orgao.titular.toLowerCase().includes(query)) ||
        (orgao.bairro && orgao.bairro.toLowerCase().includes(query))
      );

      renderGBP(filtered);
    });
  }

  // Adicionar marcador GBP
  function addGBPMarker(locationData) {
    try {
      const point = new Point({
        longitude: locationData.longitude,
        latitude: locationData.latitude
      });

      const markerSymbol = new SimpleMarkerSymbol({
        color: [255, 165, 0], // Laranja (Orange)
        size: 12,
        outline: {
          color: [255, 255, 255],
          width: 2
        }
      });

      const graphic = new Graphic({
        geometry: point,
        symbol: markerSymbol,
        attributes: {
          tipo: 'gbp',
          ...locationData
        }
      });

      view.graphics.add(graphic);
      GBP_MARKERS.push(graphic);
    } catch (error) {
      console.error('✗ Erro ao adicionar marcador GBP:', error);
    }
  }

  // Carregar dados GBP (dados principais para o botão clicável)
  function loadGBPMarkers() {
    console.log('Carregando dados GBP...');

    // Carregar coords_por_nome_novo.json para pegar coordenadas
    fetch('coords_por_nome_novo (1).json')
      .then(response => response.json())
      .then(coordsData => {
        console.log('✓ Coordenadas carregadas');
        
        // Carregar GBP.json para o botão principal
        fetch('GBP.json')
          .then(response => response.json())
          .then(data => {
            console.log('✓ Dados GBP.json carregados');
            
            const nomePlainText = data.titulo ? data.titulo.replace(/\n/g, ' ').trim() : (data.geral?.cargo || "Gabinete do Prefeito");
            const coordsInfo = coordsData[nomePlainText];
            
            const gbpData = {
              nome: "GBP",
              titular: data.geral?.titular,
              cargo: data.geral?.cargo,
              telefone: data.comunicacoes?.find(c => c.tipo.includes("Telefone"))?.valor,
              email: data.comunicacoes?.find(c => c.tipo.includes("E-mail"))?.valor,
              endereco: `${data.endereco?.logradouro}, ${data.endereco?.numero}${data.endereco?.complemento ? ' - ' + data.endereco?.complemento : ''}`,
              bairro: data.endereco?.bairro || (coordsInfo?.bairro),
              latitude: coordsInfo?.latitude || -22.9101587,
              longitude: coordsInfo?.longitude || -43.2033722,
              tipo: 'gbp'
            };
            
            ALL_GBP_DATA = [gbpData];
            addGBPMarker(gbpData);
          })
          .catch(error => console.error('✗ Erro ao carregar GBP.json:', error));
        
        // Carregar GBP_consolidado.json para a lista expandível
        fetch('GBP_consolidado.json')
          .then(response => response.json())
          .then(data => {
            console.log('✓ Dados GBP_consolidado.json carregados');
            loadGBPList(data, coordsData);
          })
          .catch(error => console.error('✗ Erro ao carregar GBP_consolidado.json:', error));
      })
      .catch(error => console.error('✗ Erro ao carregar coords:', error));
  }

  // Carregar dados PCRJ
  function loadPCRJMarkers() {
    console.log('Carregando dados PCRJ...');

    fetch('PCRJ.json')
      .then(response => response.json())
      .then(data => {
        console.log('✓ Dados PCRJ carregados');
        
        const pcrjData = {
          nome: data.geral?.cargo || "Prefeito",
          titular: data.geral?.titular,
          telefone: data.comunicacoes?.find(c => c.tipo.includes("Telefone"))?.valor,
          email: data.comunicacoes?.find(c => c.tipo.includes("E-mail"))?.valor,
          endereco: `${data.endereco?.logradouro}, ${data.endereco?.numero}`,
          bairro: data.endereco?.bairro,
          latitude: -22.9068,
          longitude: -43.1814,
          tipo: 'pcrj'
        };
        
        ALL_PCRJ_DATA = pcrjData;
        addPCRJMarker(pcrjData);
      })
      .catch(error => console.error('✗ Erro ao carregar PCRJ:', error));
  }

  // Adicionar marcador PCRJ
  function addPCRJMarker(locationData) {
    try {
      const point = new Point({
        longitude: locationData.longitude,
        latitude: locationData.latitude
      });

      const markerSymbol = new SimpleMarkerSymbol({
        color: [220, 20, 60], // Vermelho (Crimson)
        size: 12,
        outline: {
          color: [255, 255, 255],
          width: 2
        }
      });

      const graphic = new Graphic({
        geometry: point,
        symbol: markerSymbol,
        attributes: {
          tipo: 'pcrj',
          ...locationData
        }
      });

      view.graphics.add(graphic);
      PCRJ_MARKERS.push(graphic);
    } catch (error) {
      console.error('✗ Erro ao adicionar marcador PCRJ:', error);
    }
  }

  // Adicionar marcador SMS
  function addSMSMarker(locationData) {
    try {
      const point = new Point({
        longitude: locationData.longitude,
        latitude: locationData.latitude
      });

      const markerSymbol = new SimpleMarkerSymbol({
        color: [34, 139, 34], // Verde Escuro (Dark Green)
        size: 15, // Aumentado de 12
        outline: {
          color: [255, 255, 255],
          width: 2.5
        }
      });

      const graphic = new Graphic({
        geometry: point,
        symbol: markerSymbol,
        attributes: {
          tipo: 'sms',
          ...locationData
        }
      });

      view.graphics.add(graphic);
      SMS_MARKERS.push(graphic);
    } catch (error) {
      console.error('✗ Erro ao adicionar marcador SMS:', error);
    }
  }

  // Adicionar marcador GBP
  function addGBPMarker(locationData) {
    try {
      const point = new Point({
        longitude: locationData.longitude,
        latitude: locationData.latitude
      });

      const markerSymbol = new SimpleMarkerSymbol({
        color: [255, 165, 0], // Laranja (Orange)
        size: 12,
        outline: {
          color: [255, 255, 255],
          width: 2
        }
      });

      const graphic = new Graphic({
        geometry: point,
        symbol: markerSymbol,
        attributes: {
          tipo: 'gbp',
          ...locationData
        }
      });

      view.graphics.add(graphic);
      GBP_MARKERS.push(graphic);
    } catch (error) {
      console.error('✗ Erro ao adicionar marcador GBP:', error);
    }
  }

  // Handler de clique
  function setupClickHandler() {
    view.on("click", function(event) {
      view.hitTest(event).then(function(response) {
        if (response.results.length) {
          const hitGraphic = response.results[0].graphic;
          if (hitGraphic.attributes && hitGraphic.attributes.tipo) {
            showInfoPanel(hitGraphic.attributes);
          }
        }
      });
    });
  }

  // Exibir painel de informações - IMPROVED
  function showInfoPanel(data) {
    let telefoneLink = data.telefone ? `<a href="tel:${data.telefone}">${data.telefone}</a>` : 'Não informado';
    let emailLink = data.email ? `<a href="mailto:${data.email}">${data.email}</a>` : 'Não informado';
    let bairroDisplay = data.bairro && data.bairro !== 'undefined' ? data.bairro : 'Não informado';
    
    infoPanelContent.innerHTML = `
      <div class="info-header">
        <h3>${data.nome || "Informação"}</h3>
        <span class="bairro-badge">${bairroDisplay}</span>
      </div>

      <div class="info-field">
        <div class="info-label">Titular</div>
        <div class="info-value">${data.titular || 'Não informado'}</div>
      </div>

      <div class="info-field">
        <div class="info-label">Cargo</div>
        <div class="info-value">${data.cargo || 'Não informado'}</div>
      </div>

      <div class="info-field">
        <div class="info-label">Endereço</div>
        <div class="info-value">${data.endereco || 'Não informado'}</div>
      </div>

      <div class="info-field">
        <div class="info-label">Telefone</div>
        <div class="info-value">${telefoneLink}</div>
      </div>

      <div class="info-field">
        <div class="info-label">Email</div>
        <div class="info-value">${emailLink}</div>
      </div>

      <div class="info-field">
        <div class="info-label">Coordenadas</div>
        <div class="info-value">${data.latitude?.toFixed(4)}, ${data.longitude?.toFixed(4)}</div>
      </div>
    `;
    infoPanel.classList.add("active");
  }

  // API pública
  window.clearMarkers = function() {
    SMS_MARKERS.forEach(marker => view.graphics.remove(marker));
    GBP_MARKERS.forEach(marker => view.graphics.remove(marker));
    PCRJ_MARKERS.forEach(marker => view.graphics.remove(marker));
    SMS_MARKERS.length = 0;
    GBP_MARKERS.length = 0;
    PCRJ_MARKERS.length = 0;
    infoPanel.classList.remove("active");
  };

  window.addSMSMarkers = function(locationsArray) {
    locationsArray.forEach(location => addSMSMarker(location));
  };

  window.addSMSMarker = function(location) {
    addSMSMarker(location);
  };

  // Inicializar quando view estiver pronto
  view.when(function() {
    console.log('✓ View pronto!');
    loadRioStateLayer();
    loadSMSMarkers();
    loadGBPMarkers();
    loadPCRJMarkers();
    setupClickHandler();
    console.log('✓ Aplicação inicializada com sucesso!');
  }).catch(error => {
    console.error('✗ Erro ao inicializar view:', error);
  });

});

