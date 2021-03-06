import { injectable, inject } from "inversify";
import Currency, { ICurrency } from "@models/Currency";
import types from "@core/types";
import UnsupportedSymbolError from "../utils/errors/UnsuportedSymbolError";
import DuplicatedSymbolError from "@utils/errors/DuplicatedSymbolError";
import ExchangeRepository from "./ExchangeRepository";
import { get } from "@utils/cache";

@injectable()
export default class CurrencyRepository {

  constructor(@inject(types.ExchangeRepository) private exchangeRepository: ExchangeRepository) { }

  async findById(id: number) {
    return await Currency.findByPk(id);
  }

  async findBySymbol(symbol: string): Promise<Currency | null> {

    const cached = await get('currencies');

    if (cached) {
      const result = JSON.parse(cached).find(c => c.symbol === symbol);

      if (result)
        return result;
    }

    const currency: Currency = await Currency.findOne({ where: { symbol } });
    return currency;
  }

  async index() {
    return await Currency.findAll();
  }

  async create(data: ICurrency) {

    const currency: Currency = await Currency.findOne({ where: { symbol: data.symbol }, paranoid: false });

    if (currency) {
      if (!currency.deletedAt)
        throw new DuplicatedSymbolError("There is already a currency with that symbol");

      else {
        currency.restore();
        return currency;
      }
    }


    const symbols = await this.exchangeRepository.symbols();

    if (!symbols.some(s => s.symbol === data.symbol))
      throw new UnsupportedSymbolError("This currency symbol is not supported by the application");

    return await Currency.create(data);
  }

  async delete(id: number) {
    const affected = await Currency.destroy({ where: { id } });
    return (affected && affected > 0) ? true : false;
  }
}