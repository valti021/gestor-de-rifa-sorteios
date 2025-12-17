function carregarAgendaRifa() {
    const selectDia = document.getElementById('dia_semana');
    const selectMes = document.getElementById('mes');
    const selectAno = document.getElementById('ano');
    const selectHorario = document.getElementById('horario');
    const selectDataFinal = document.getElementById('data_sorteio');

    if (!selectDia || !selectMes || !selectAno || !selectHorario || !selectDataFinal) {
        console.warn('Modal ainda não está disponível no DOM.');
        return;
    }

    fetch('../php/modal-data-rifa.php')
        .then(res => res.json())
        .then(data => {
            if (data.erro) {
                console.error(data.erro);
                return;
            }

            const agenda = data.agenda;
            const anosDisponiveis = data.anos;

            // ==========================
            // Utils
            // ==========================
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

            // ==========================
            // Preencher selects
            // ==========================
            function preencherDias() {
                resetSelect(selectDia, 'Selecione o dia');
                const diasUnicos = {};

                agenda.forEach(item => {
                    diasUnicos[item.dia_semana_numero] = item.dia_semana_nome;
                });

                Object.keys(diasUnicos).forEach(numero => {
                    const option = document.createElement('option');
                    option.value = numero;
                    option.textContent = diasUnicos[numero];
                    selectDia.appendChild(option);
                });
            }

            function preencherMeses() {
                resetSelect(selectMes, 'Selecione o mês');
                const mesesUnicos = [...new Set(agenda.map(item => item.mes))];

                mesesUnicos.forEach(mes => {
                    const option = document.createElement('option');
                    option.value = mes;
                    option.textContent = mes;
                    selectMes.appendChild(option);
                });
            }

            function preencherAnos() {
                resetSelect(selectAno, 'Selecione o ano');
                anosDisponiveis.forEach(ano => {
                    const option = document.createElement('option');
                    option.value = ano;
                    option.textContent = ano;
                    selectAno.appendChild(option);
                });
            }

            function preencherHorarios() {
                resetSelect(selectHorario, 'Selecione o horário');
                const dia = selectDia.value;
                const mes = selectMes.value;

                if (!dia || !mes) return;

                const horarios = agenda
                    .filter(item => item.dia_semana_numero == dia && item.mes === mes)
                    .map(item => item.horario);

                [...new Set(horarios)].forEach(h => {
                    const option = document.createElement('option');
                    option.value = h;
                    option.textContent = h;
                    selectHorario.appendChild(option);
                });
            }

            // ==========================
            // Gerar datas reais
            // ==========================
            function gerarDatasReais() {
                resetSelect(selectDataFinal, 'Selecione a data do sorteio');
                const diaSemana = parseInt(selectDia.value);
                const mes = selectMes.value;
                const ano = parseInt(selectAno.value);

                if (isNaN(diaSemana) || !mes || isNaN(ano)) return;

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
            }

            // ==========================
            // Inicialização
            // ==========================
            preencherDias();
            preencherMeses();
            preencherAnos();
            preencherHorarios();

            // ==========================
            // Eventos
            // ==========================
            selectDia.addEventListener('change', () => {
                preencherHorarios();
                resetSelect(selectDataFinal, 'Selecione a data do sorteio');
            });

            selectMes.addEventListener('change', () => {
                preencherHorarios();
                resetSelect(selectDataFinal, 'Selecione a data do sorteio');
            });

            selectAno.addEventListener('change', gerarDatasReais);
            selectHorario.addEventListener('change', gerarDatasReais);

        })
        .catch(err => {
            console.error('Erro ao carregar agenda:', err);
        });
}

carregarAgendaRifa();