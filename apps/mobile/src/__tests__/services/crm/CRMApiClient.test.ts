import { CRMApiClient } from '@/services/crm/CRMApiClient';

describe('CRMApiClient', () => {
  let client: CRMApiClient;
  const config = { apiBaseUrl: 'https://api.test.com', apiKey: 'test-key', enabled: true };

  beforeEach(() => {
    client = new CRMApiClient(config);
    (global.fetch as jest.Mock).mockReset();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ contact: { id: 'c-1' } }),
    });
  });

  it('returns error when CRM is disabled', async () => {
    const disabled = new CRMApiClient({ ...config, enabled: false });
    const result = await disabled.createContact({ email: 'test@test.com' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('CRM is disabled');
  });

  it('createContact sends POST', async () => {
    await client.createContact({ email: 'test@test.com' });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/contacts/',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('createContact includes auth header', async () => {
    await client.createContact({ email: 'test@test.com' });
    const call = (global.fetch as jest.Mock).mock.calls[0];
    expect(call[1].headers.Authorization).toBe('Bearer test-key');
  });

  it('updateContact sends PUT', async () => {
    await client.updateContact('c-1', { email: 'new@test.com' });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/contacts/c-1',
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('getContact sends GET', async () => {
    await client.getContact('c-1');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/contacts/c-1',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('deleteContact sends DELETE', async () => {
    await client.deleteContact('c-1');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/contacts/c-1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('findContactByEmail encodes email', async () => {
    await client.findContactByEmail('test@test.com');
    const url = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(url).toContain('test%40test.com');
  });

  it('searchContacts encodes query', async () => {
    await client.searchContacts('John Doe');
    const url = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(url).toContain('John%20Doe');
  });

  it('handles API error response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Bad request' }),
    });
    const result = await client.createContact({ email: 'test@test.com' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Bad request');
    expect(result.statusCode).toBe(400);
  });

  it('handles network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network failed'));
    const result = await client.createContact({ email: 'test@test.com' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Network failed');
  });

  it('createOpportunity sends POST', async () => {
    await client.createOpportunity({ title: 'Deal', status: 'open', contactId: 'c-1' });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/opportunities/',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('updateOpportunityStatus sends PUT', async () => {
    await client.updateOpportunityStatus('o-1', 'won');
    const url = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(url).toContain('/opportunities/o-1/status');
  });

  it('addNote sends POST to notes endpoint', async () => {
    await client.addNote({ contactId: 'c-1', body: 'A note' });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/contacts/c-1/notes/',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('addActivity formats body with type', async () => {
    await client.addActivity('c-1', 'call', 'Called client');
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.body).toBe('[call] Called client');
  });

  it('isConfigured returns true when fully configured', () => {
    expect(client.isConfigured()).toBe(true);
  });

  it('isConfigured returns false without apiKey', () => {
    const c = new CRMApiClient({ ...config, apiKey: '' });
    expect(c.isConfigured()).toBe(false);
  });

  it('updateConfig merges config', () => {
    client.updateConfig({ apiKey: 'new-key' });
    expect(client.isConfigured()).toBe(true);
  });

  it('addTagToContact sends POST to tags endpoint', async () => {
    await client.addTagToContact('c-1', 'vip');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/contacts/c-1/tags',
      expect.objectContaining({ method: 'POST' })
    );
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.tags).toEqual(['vip']);
  });

  it('removeTagFromContact sends DELETE to tags endpoint', async () => {
    await client.removeTagFromContact('c-1', 'vip');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/contacts/c-1/tags',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('updateOpportunity sends PUT', async () => {
    await client.updateOpportunity('o-1', { title: 'Updated' });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/opportunities/o-1',
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('getOpportunity sends GET', async () => {
    await client.getOpportunity('o-1');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/opportunities/o-1',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('deleteOpportunity sends DELETE', async () => {
    await client.deleteOpportunity('o-1');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/opportunities/o-1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('createTask sends POST', async () => {
    await client.createTask({ title: 'Follow up', dueDate: '2024-01-01' });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/tasks/',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('updateTask sends PUT', async () => {
    await client.updateTask('t-1', { title: 'Updated task' });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/tasks/t-1',
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('completeTask sends PUT with completed', async () => {
    await client.completeTask('t-1');
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.completed).toBe(true);
  });

  it('deleteTask sends DELETE', async () => {
    await client.deleteTask('t-1');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/tasks/t-1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('isConfigured false without apiBaseUrl', () => {
    const c = new CRMApiClient({ ...config, apiBaseUrl: '' });
    expect(c.isConfigured()).toBe(false);
  });

  it('isConfigured false when disabled', () => {
    const c = new CRMApiClient({ ...config, enabled: false });
    expect(c.isConfigured()).toBe(false);
  });

  it('handles error response with error field', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal server error' }),
    });
    const result = await client.getContact('c-1');
    expect(result.error).toBe('Internal server error');
  });

  it('handles non-Error thrown', async () => {
    (global.fetch as jest.Mock).mockRejectedValue('string error');
    const result = await client.getContact('c-1');
    expect(result.error).toBe('Unknown error');
  });

  it('sets Content-Type header', async () => {
    await client.getContact('c-1');
    const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('does not include body for GET requests', async () => {
    await client.getContact('c-1');
    expect((global.fetch as jest.Mock).mock.calls[0][1].body).toBeUndefined();
  });
});
