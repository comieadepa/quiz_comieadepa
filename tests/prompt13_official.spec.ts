import { test, expect } from '@playwright/test';

const devices = [
  { name: 'desktop_1600x900', width: 1600, height: 900 },
  { name: 'tablet_1024x768', width: 1024, height: 768 },
  { name: 'celular_390x844', width: 390, height: 844 },
];

for (const device of devices) {
  test(`Prompt 13 - Fluxo Completo Oficial (${device.name})`, async ({ page }) => {
    await page.setViewportSize({ width: device.width, height: device.height });
    await page.goto('http://localhost:3003/pesquisa');

    // ETAPA 0: Identificação da Região
    await expect(page.locator('text=Avaliação Institucional dos Ministros')).toBeVisible();
    const inputRegiao = page.locator('input[type="text"]');
    await expect(inputRegiao).toBeVisible();

    // Botão de avançar deve estar desabilitado enquanto a região estiver vazia
    const btnAvancar = page.getByRole('button', { name: 'Iniciar Questionário' });
    await expect(btnAvancar).toBeDisabled();

    // Preenche a região
    await inputRegiao.fill('Baixo Amazonas');
    await expect(btnAvancar).toBeEnabled();
    await page.screenshot({ path: `scratch/p13_${device.name}_etapa0_regiao.png` });
    await btnAvancar.click();

    // ETAPA 1: Gestão Administrativa (Escala de 0 a 10)
    await expect(page.locator('text=Em uma escala de 0 a 10')).toBeVisible();
    // Clica na nota 10
    const btnNota10 = page.getByRole('button', { name: '10' });
    await expect(btnNota10).toBeVisible();
    await btnNota10.click();
    await page.screenshot({ path: `scratch/p13_${device.name}_etapa1_nota10.png` });
    await page.getByRole('button', { name: 'Próxima' }).click();

    // ETAPA 2: Dificuldade (6 opções)
    await expect(page.locator('text=Qual a principal dificuldade')).toBeVisible();
    await page.getByRole('button', { name: 'Financeira' }).click();
    await page.getByRole('button', { name: 'Próxima' }).click();

    // ETAPA 3: Demandas da região (Sim / Às vezes / Não)
    await expect(page.locator('text=demandas da sua região')).toBeVisible();
    await page.getByRole('button', { name: 'Sim' }).click();
    await page.getByRole('button', { name: 'Próxima' }).click();

    // ETAPA 4: Prestação de contas (Clara / Parcial / Insuficiente / Não conheço)
    await expect(page.locator('text=prestação de contas')).toBeVisible();
    await page.getByRole('button', { name: 'Clara' }).click();
    await page.getByRole('button', { name: 'Próxima' }).click();

    // ETAPA 5: Amparo ministerial (Sim / Em parte / Não)
    await expect(page.locator('text=amparado pela Convenção')).toBeVisible();
    await page.getByRole('button', { name: 'Sim' }).click();
    await page.getByRole('button', { name: 'Próxima' }).click();

    // ETAPA 6: Frequência de visitas (Frequente / Ocasional / Rara / Nunca)
    await expect(page.locator('text=visitas da diretoria')).toBeVisible();
    await page.getByRole('button', { name: 'Frequente' }).click();
    await page.getByRole('button', { name: 'Próxima' }).click();

    // ETAPA 7: Formação teológica (Sim / Em parte / Não)
    await expect(page.locator('text=formação teológica e ministerial')).toBeVisible();
    await page.getByRole('button', { name: 'Sim' }).click();
    await page.getByRole('button', { name: 'Próxima' }).click();

    // ETAPA 8: Campo Livre (Opcional)
    await expect(page.locator('text=Espaço livre: deixe aqui sua sugestão')).toBeVisible();
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();

    // Testa conclusão SEM preencher o campo livre no mobile/tablet e COM texto no desktop
    const btnFinalizar = page.getByRole('button', { name: 'Finalizar Pesquisa' });
    await expect(btnFinalizar).toBeEnabled();
    await page.screenshot({ path: `scratch/p13_${device.name}_etapa8_campolivre_opcional.png` });
    
    if (device.name.includes('desktop')) {
      await textarea.fill('Parabéns à liderança da COMIEADEPA pela iniciativa transparente e inovadora nesta AGO 2026.');
    }
    await btnFinalizar.click();

    // TELA DE AGRADECIMENTO / CONCLUSÃO (aguarda até 15s pela resposta da rede/Supabase)
    const tituloAgradecimento = page.locator('text=Obrigado pela sua contribuição!');
    await expect(tituloAgradecimento).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('link', { name: 'OK' })).toBeVisible();
    await expect(page.locator('text=Retornando à tela inicial')).toBeVisible();
    await page.screenshot({ path: `scratch/p13_${device.name}_finalizacao_ok.png` });
  });
}
