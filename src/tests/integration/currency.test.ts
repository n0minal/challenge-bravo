import app from "@core/application";
import nock from "nock";
import request from 'supertest';
import CurrencyFactory from '@factories/CurrencyFactory';
import { clearTakenCurrencies } from '@database/faker/currency';
import sequelize from "@config/database";
import Currency, { ICurrency } from "@models/Currency";

import { MockGetSymbolsRequest as mockGetSymbolsRequest } from "../mocks/CoinAPIMock";
import { wipe } from "@utils/cache";


describe('currency integration test suite', () => {

  beforeEach(async () => {
    await sequelize.sync({ force: true })
    await wipe();
  });

  afterEach(() => {
    nock.cleanAll()
    clearTakenCurrencies();
  });

  it('should find all currencies', async () => {
    await CurrencyFactory.createMany('Currency', 3);

    const response = await request(app.router)
      .get('/currencies');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);
  });

  it('should find a specific currency by its id', async () => {
    const currencies: ICurrency[] = await CurrencyFactory.createMany('Currency', 10);

    const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];

    const response = await request(app.router)
      .get(`/currencies/${randomCurrency.id}`);

    expect(response.status).toBe(200);
    expect({
      id: response.body.id,
      name: response.body.name,
      symbol: response.body.symbol,
    }).toMatchObject({
      id: randomCurrency.id,
      name: randomCurrency.name,
      symbol: randomCurrency.symbol
    });
  });

  it('should create a currency with valid params', async () => {
    mockGetSymbolsRequest();

    const params: Currency = await CurrencyFactory.attrs('Currency');

    const response = await request(app.router)
      .post('/currencies')
      .send({ name: params.name, symbol: params.symbol });

    expect(response.status).toBe(201);
    expect({
      name: response.body.name,
      symbol: response.body.symbol
    }).toMatchObject({
      name: params.name,
      symbol: params.symbol
    });
  });

  it('should delete a currency', async () => {
    const totalCurrencies = 10;
    const currencies: ICurrency[] = await CurrencyFactory.createMany('Currency', totalCurrencies);

    const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];

    const response = await request(app.router)
      .delete(`/currencies/${randomCurrency.id}`);

    const currenciesResponse = await request(app.router)
      .get('/currencies');

    expect(response.status).toBe(200);
    expect(response.body).toBeTruthy();
    expect(currenciesResponse.body.length).toBe(totalCurrencies - 1);
  });

  it('should not create a currency with invalid symbol but return a 422 HTTP status code', async () => {
    mockGetSymbolsRequest();

    const response = await request(app.router)
      .post('/currencies')
      .send({ name: "foo", symbol: "bar" });

    expect(response.status).toBe(422);
  });

  it('should not create a currency with duplicated symbol but return a 409 HTTP status code', async () => {
    mockGetSymbolsRequest();

    const currency: ICurrency = await CurrencyFactory.create('Currency');

    const response = await request(app.router)
      .post('/currencies')
      .send({ name: "foo", symbol: currency.symbol });

    expect(response.status).toBe(409);
  });

});