/**
 * Modal Criar Rifa - Carregamento da Agenda
 * Responsável por: buscar, popular e gerenciar datas e horários de sorteio
 */
document.addEventListener("modalCriarRifa:carregado", () => {
    console.log("📅 Inicializando agenda de sorteios...");

    const selectDia = document.getElementById('dia_semana');
    const selectMes = document.getElementById('mes');
    const selectAno = document.getElementById('ano');
    const selectHorario = document.getElementById('horario');
    const selectDataFinal = document.getElementById('data_sorteio');
    const selectHorarioFinal = document.getElementById('horario_sorteio');
    
    if (!selectDia || !selectMes || !selectAno || !selectHorario || !selectDataFinal || !selectHorarioFinal) {
        console.warn('⚠️ Elementos da agenda não encontrados. Tentando novamente...');
        setTimeout(carregarAgenda, 100);
        return;
    }

    carregarAgenda();

    // ====================================
    // FUNÇÃO PRINCIPAL DE CARREGAMENTO
    // ====================================
    function carregarAgenda() {
        console.log("🔄 Requisitando dados da agenda...");
        
        fetch('../php/modal-data-rifa.php')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Erro HTTP: ${res.status} ${res.statusText}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.erro) {
                    console.error('❌ Erro na resposta:', data.erro);
                    return;
                }
                
                const agenda = data.agenda;
                const anosDisponiveis = data.anos;
                
                console.log(`✅ Agenda carregada: ${agenda.length} itens, ${anosDisponiveis.length} anos`);
                
                // Inicializar os selects
                inicializarAgenda(agenda, anosDisponiveis);
            })
            .catch(err => {
                console.error('❌ Erro ao carregar agenda:', err);
            });
    }

    function inicializarAgenda(agenda, anosDisponiveis) {
        // Preencher selects iniciais
        preencherDias(agenda);
        preencherMeses(agenda);
        preencherAnos(anosDisponiveis);
        preencherHorarios(agenda);

        // Configurar eventos
        selectDia.addEventListener('change', () => {
            preencherHorarios(agenda);
            resetSelect(selectDataFinal, 'Selecione a data');
            resetSelect(selectHorarioFinal, 'Selecione o horário');
            selectDataFinal.disabled = true;
            selectHorarioFinal.disabled = true;
        });
        
        selectMes.addEventListener('change', () => {
            preencherHorarios(agenda);
            resetSelect(selectDataFinal, 'Selecione a data');
            resetSelect(selectHorarioFinal, 'Selecione o horário');
            selectDataFinal.disabled = true;
            selectHorarioFinal.disabled = true;
        });
        
        selectAno.addEventListener('change', () => {
            gerarDatasReais(agenda);
        });
        
        selectHorario.addEventListener('change', () => {
            gerarDatasReais(agenda);
        });

        // Disparar evento inicial
        if (agenda.length > 0 && selectDia.options.length > 1) {
            setTimeout(() => {
                selectDia.selectedIndex = 1;
                selectDia.dispatchEvent(new Event('change'));
            }, 100);
        }

        console.log("✅ Agenda inicializada");
    }

    // ====================================
    // FUNÇÕES AUXILIARES
    // ====================================
    function resetSelect(select, texto) {
        select.innerHTML = `<option value="">${texto}</option>`;
    }

    function converterMesParaNumero(mes) {
        const mapa = {
            Jan: 1, Fev: 2, Mar: 3, Abr: 4, Mai: 5, Jun: 6,
            Jul: 7, Ago: 8, Set: 9, Out: 10, Nov: 11, Dez: 12
        };
        return mapa[mes];
    }

    function preencherDias(agenda) {
        resetSelect(selectDia, 'Selecione o dia');
        const diasUnicos = {};
        
        agenda.forEach(item => {
            diasUnicos[item.dia_semana_numero] = item.dia_semana_nome;
        });
        
        Object.keys(diasUnicos).sort().forEach(numero => {
            const option = document.createElement('option');
            option.value = numero;
            option.textContent = diasUnicos[numero];
            selectDia.appendChild(option);
        });
    }

    function preencherMeses(agenda) {
        resetSelect(selectMes, 'Selecione o mês');
        const mesesUnicos = [...new Set(agenda.map(item => item.mes))];
        
        mesesUnicos.forEach(mes => {
            const option = document.createElement('option');
            option.value = mes;
            option.textContent = mes;
            selectMes.appendChild(option);
        });
    }

    function preencherAnos(anosDisponiveis) {
        resetSelect(selectAno, 'Selecione o ano');
        anosDisponiveis.forEach(ano => {
            const option = document.createElement('option');
            option.value = ano;
            option.textContent = ano;
            selectAno.appendChild(option);
        });
    }

    function preencherHorarios(agenda) {
        resetSelect(selectHorario, 'Selecione o horário');
        const dia = selectDia.value;
        const mes = selectMes.value;
        
        if (!dia || !mes) return;
        
        const horarios = agenda
            .filter(item => item.dia_semana_numero == dia && item.mes === mes)
            .map(item => item.horario);
        
        [...new Set(horarios)].sort().forEach(h => {
            const option = document.createElement('option');
            option.value = h;
            option.textContent = h;
            selectHorario.appendChild(option);
        });
    }

    function gerarDatasReais(agenda) {
        resetSelect(selectDataFinal, 'Selecione a data');
        resetSelect(selectHorarioFinal, 'Selecione o horário');
        
        const diaSemana = parseInt(selectDia.value);
        const mes = selectMes.value;
        const ano = parseInt(selectAno.value);
        const horarioSelecionado = selectHorario.value;
        
        if (isNaN(diaSemana) || !mes || isNaN(ano) || !horarioSelecionado) {
            selectDataFinal.disabled = true;
            selectHorarioFinal.disabled = true;
            return;
        }
        
        const mesNumero = converterMesParaNumero(mes);
        const datas = [];
        const data = new Date(ano, mesNumero - 1, 1);
        
        while (data.getMonth() === mesNumero - 1) {
            if (data.getDay() === diaSemana) {
                const dia = String(data.getDate()).padStart(2, '0');
                const mesFmt = String(mesNumero).padStart(2, '0');
                const dataFormatada = `${dia}/${mesFmt}/${ano}`;
                const dataISO = `${ano}-${mesFmt}-${dia}`;
                
                datas.push({ label: dataFormatada, value: dataISO });
            }
            data.setDate(data.getDate() + 1);
        }
        
        datas.forEach(d => {
            const option = document.createElement('option');
            option.value = d.value;
            option.textContent = d.label;
            selectDataFinal.appendChild(option);
        });
        
        // Preencher horários disponíveis
        const horariosDisponiveis = [...new Set(agenda.map(item => item.horario))].sort();
        horariosDisponiveis.forEach(h => {
            const option = document.createElement('option');
            option.value = h;
            option.textContent = h;
            selectHorarioFinal.appendChild(option);
        });
        
        if (horarioSelecionado) {
            selectHorarioFinal.value = horarioSelecionado;
        }
        
        selectDataFinal.disabled = false;
        selectHorarioFinal.disabled = false;
    }

    // Expor funções globalmente
    window.AgendaUtils = {
        recarregarAgenda: carregarAgenda
    };

    console.log("✅ Agenda inicializada");
});
