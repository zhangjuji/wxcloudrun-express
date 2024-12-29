const request = require('supertest');
const express = require('express');
const axios = require('axios');

// 模拟 axios
jest.mock('axios');

// 导入 app（需要先修改 index.js 以导出 app）
const app = require('./index').app;

describe('微信 OpenID API 测试', () => {
  
  // 每个测试后清除所有 mock
  afterEach(() => {
    jest.clearAllMocks();
  });

  // 测试缺少 code 参数的情况
  test('没有提供 code 参数时应返回 400 错误', async () => {
    const response = await request(app)
      .get('/api/wx_openid')
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toEqual({
      error: 'Missing code parameter'
    });
  });

  // 测试成功获取 openid 的情况
  test('成功获取 openid', async () => {
    const mockOpenid = 'test_openid_123';
    axios.get.mockResolvedValue({
      data: { openid: mockOpenid }
    });

    const response = await request(app)
      .get('/api/wx_openid?code=valid_code')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({
      openid: mockOpenid
    });
  });

  // 测试微信API返回错误的情况
  test('微信API返回错误时应返回500错误', async () => {
    axios.get.mockRejectedValue({
      response: { status: 500 }
    });

    const response = await request(app)
      .get('/api/wx_openid?code=invalid_code')
      .expect('Content-Type', /json/)
      .expect(500);

    expect(response.body).toEqual({
      error: 'Failed to fetch openid from API'
    });
  });

  // 测试返回的数据中没有 openid 的情况
  test('返回数据中没有 openid 时应返回400错误', async () => {
    axios.get.mockResolvedValue({
      data: { } // 空对象，没有 openid
    });

    const response = await request(app)
      .get('/api/wx_openid?code=valid_code')
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toEqual({
      error: 'openid not found in response'
    });
  });
}); 