import { test, expect } from '@playwright/test';

test.describe('Prompt 15 - Auditoria e Testes de Segurança / Admin', () => {
  
  // 1. Bloqueio de acesso não autorizado à API administrativa
  test('Bloqueio de acesso não autorizado a /api/admin/stats', async ({ request }) => {
    const res = await request.get('http://localhost:3003/api/admin/stats');
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('Acesso não autorizado');
  });

  // 2. Tentativa de login com senha incorreta
  test('Rejeição de login com credencial inválida', async ({ page }) => {
    await page.goto('http://localhost:3003/admin');
    await page.locator('input[type="password"]').fill('senha_errada_123');
    await page.locator('button[type="submit"]').click();

    // Mensagem de erro deve ser exibida e continuar desautenticado
    const erro = page.locator('text=Chave de acesso inválida');
    await expect(erro).toBeVisible();
    await expect(page.locator('text=Painel da Gestão AGO 2026')).toBeVisible();
  });

  // 3. Login com sucesso, cookie HttpOnly e acesso às estatísticas
  test('Login bem-sucedido, recebimento de cookie de sessão e visualização de dados', async ({ page }) => {
    await page.goto('http://localhost:3003/admin');
    await page.locator('input[type="password"]').fill('admin');
    await page.locator('button[type="submit"]').click();

    // Deve carregar o painel administrativo autenticado
    await expect(page.locator('text=Sessão Autenticada com HttpOnly Cookie')).toBeVisible();
    await expect(page.locator('text=Total de Respostas Oficiais')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Exportar Dados em CSV/Excel' })).toBeVisible();

    // Testa Logout
    await page.getByRole('button', { name: 'Sair' }).click();
    await expect(page.locator('text=Acesso administrativo protegido no servidor')).toBeVisible();
  });

  // 4. Bloqueio de avanço sem preencher campos obrigatórios em /pesquisa
  test('Pesquisa: bloqueia avanço com campo Região vazio e sem seleção de nota', async ({ page }) => {
    await page.goto('http://localhost:3003/pesquisa');
    
    // Botão Iniciar deve estar desabilitado
    const btnIniciar = page.getByRole('button', { name: 'Iniciar Questionário' });
    await expect(btnIniciar).toBeDisabled();

    // Preenche região e avança
    await page.locator('input[type="text"]').fill('Região Teste Auditoria');
    await expect(btnIniciar).toBeEnabled();
    await btnIniciar.click();

    // Na Q1, botão Próxima deve estar desabilitado até selecionar nota
    const btnProxima = page.getByRole('button', { name: 'Próxima' });
    await expect(btnProxima).toBeDisabled();

    // Seleciona nota 9
    await page.getByRole('button', { name: '9' }).click();
    await expect(btnProxima).toBeEnabled();
  });
});
