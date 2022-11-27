import chai from 'chai';
import express from "express"
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'
import cors from 'cors'

import * as data from '../data/imdb-movies-data.mjs'
import * as userData from '../data/cmdb-data-mem.mjs'
import servicesInt from '../services/cmdb-services.mjs'
import apiInit from '../api/cmdb-web-api.mjs'

const expect = chai.expect
const should = chai.should()

describe("Data Module",function () {
    const user = {id: 1,
                  token: "dac7dfa1-660e-4436-b487-8124ada49f91"
                 }
    it("testing get Groups from a valid user",async function () {
        const sut =  [
                {id: 1, name: "teste_update", description: "",},
                {id: 2, name: "teste2", description: "teste de descrição",},
                {id: 3, name: "acçao", description: "lista de filmes para ver no fim de semana",}]
        let test = await userData.getGroups(user.id)
        expect(test).to.eql(sut)
    })

    it('should not return a group', async function () {
        let test = await userData.getGroup(1,10)
        expect(test).to.eql(undefined)
    });

    it('should return a group', async function () {
        let sut = await userData.getGroup(1,3)
        expect(sut.hasOwnProperty("id")).to.eql(true)
    });


})