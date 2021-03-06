import "reflect-metadata";
import { Container } from 'inversify';
import types from './types';

import ExchangeService from '@services/contracts/ExchangeService';
import CoinAPIService from '@services/CoinAPIService';

import CurrencyService from '@services/contracts/CurrencyService';
import HurbCurrencyService from '@services/HurbCurrencyService';
import ExchangeController from '@controllers/ExchangeController';
import CurrencyController from '@controllers/CurrencyController';
import ExchangeRepository from "../repositories/ExchangeRepository";
import CurrencyRepository from "../repositories/CurrencyRepository";

class Providers {
  container: Container;

  constructor() {
    this.container = new Container();
    this.register();
  }

  register() {
    this.container.bind<ExchangeService>(types.ExchangeService).to(CoinAPIService);
    this.container.bind<ExchangeController>(types.ExchangeController).to(ExchangeController);
    this.container.bind<CurrencyService>(types.CurrencyService).to(HurbCurrencyService);
    this.container.bind<CurrencyController>(types.CurrencyController).to(CurrencyController);
    this.container.bind<ExchangeRepository>(types.ExchangeRepository).to(ExchangeRepository);
    this.container.bind<CurrencyRepository>(types.CurrencyRepository).to(CurrencyRepository);
  }
}

export default new Providers();