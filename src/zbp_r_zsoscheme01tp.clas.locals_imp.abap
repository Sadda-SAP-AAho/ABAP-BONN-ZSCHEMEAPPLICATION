CLASS LHC_ZSOSCHEME DEFINITION INHERITING FROM CL_ABAP_BEHAVIOR_HANDLER.
  PRIVATE SECTION.
    METHODS:
      GET_GLOBAL_AUTHORIZATIONS FOR GLOBAL AUTHORIZATION
        IMPORTING
           REQUEST requested_authorizations FOR zsoscheme
        RESULT result,

      createSOSchemeData FOR MODIFY
        IMPORTING keys FOR ACTION zsoscheme~createSOSchemeData RESULT result.

ENDCLASS.

CLASS LHC_ZSOSCHEME IMPLEMENTATION.
  METHOD GET_GLOBAL_AUTHORIZATIONS.
  ENDMETHOD.

  METHOD createSOSchemeData.
    CONSTANTS mycid TYPE abp_behv_cid VALUE 'My%CID_soschemecalc' ##NO_TEXT.

    DATA salesorder TYPE char13.
    DATA plantcode TYPE char05.
    DATA customergroup TYPE char03.
    DATA schemecode TYPE char13.
    DATA schemegroupcode TYPE char05.
    DATA schemecheckcode TYPE char72.
    DATA schemeqty  TYPE int1.
    DATA freeqty TYPE int1.
    DATA freeqtycalc TYPE p DECIMALS 2.
    DATA minimumqty TYPE int1.

    DATA orderqty TYPE int2.
    DATA companycode TYPE char05.
    DATA productdesc TYPE char72.

    DATA create_soscheme TYPE STRUCTURE FOR CREATE ZR_zsoscheme01TP.
    DATA create_soschemetab TYPE TABLE FOR CREATE ZR_zsoscheme01TP.

    DATA create_soschemeline TYPE STRUCTURE FOR CREATE ZR_soschlines.
    DATA create_soschemelinetab TYPE TABLE FOR CREATE ZR_soschlines.

    DATA insertTag TYPE int1.
    DATA supplytag TYPE int1.


    LOOP AT keys INTO DATA(ls_key).
        insertTag = 0.
        TRY.
            salesorder = ls_key-%param-salesorder .
            salesorder = |{ salesorder  WIDTH = 10 ALIGN = RIGHT  PAD = '0' }|.

            if salesorder = ''.
              APPEND VALUE #( %cid = ls_key-%cid ) TO failed-zsoscheme.
              APPEND VALUE #( %cid = ls_key-%cid
                              %msg = new_message_with_text(
                                       severity = if_abap_behv_message=>severity-error
                                       text     = 'Sales Order No. cannot be blank.' )
                            ) TO reported-zsoscheme.
              RETURN.
            ENDIF.
        ENDTRY.

        SELECT FROM I_SalesOrder as soi
            FIELDS soi~DistributionChannel, soi~OrganizationDivision
            WHERE soi~SalesOrder = @salesorder
            INTO TABLE @DATA(so).
        LOOP AT so INTO DATA(waso).
            IF waso-DistributionChannel <> 'GT' OR waso-OrganizationDivision <> 'B2'.
              APPEND VALUE #( %cid = ls_key-%cid
                              %msg = new_message_with_text(
                                       severity = if_abap_behv_message=>severity-error
                                       text     = 'Sales Order No. must be of GT and B2 category.' )
                            ) TO reported-zsoscheme.
              RETURN.
            ENDIF.
        ENDLOOP.

        customergroup = ''.
        SELECT SINGLE FROM I_SalesOrder as soi
"        join I_Customer as cus on soi~SoldToParty = cus~Customer
        join I_CustomerSalesArea as cus on soi~SoldToParty = cus~Customer
            FIELDS cus~SalesDistrict
            WHERE soi~SalesOrder = @salesorder AND cus~DistributionChannel = 'GT' AND cus~Division = 'B2'
            INTO @DATA(customergroup2).
        customergroup = customergroup2.


        plantcode = ''.
        SELECT SINGLE FROM I_SalesOrderItem as soi
            FIELDS soi~Plant
            WHERE soi~SalesOrder = @salesorder
            INTO @DATA(plantcode2).
        plantcode = plantcode2.

        SELECT SINGLE FROM ztable_plant as pl
            FIELDS pl~comp_code
            WHERE pl~plant_code = @plantcode
            INTO @DATA(companycode2).
        companycode = companycode2.

        SELECT FROM zscheme as sch
        join zschemelines as schline on sch~bukrs = schline~bukrs and sch~schemecode = schline~schemecode
        FIELDS sch~schemecode, sch~freeqty, sch~schemeqty, sch~minimumqty, schline~productcode, schline~schemegroupcode
        WHERE sch~bukrs = @companycode and sch~customergroup = @customergroup and sch~validfrom <= @sy-datum and sch~validto >= @sy-datum
        ORDER BY sch~schemecode, schline~schemegroupcode
           INTO TABLE @DATA(ltlines).

        schemecode = ''.
        schemegroupcode = ''.
        schemecheckcode = ''.
        orderqty = 0.
        schemeqty = 0.
        freeqty = 0.
        minimumqty = 0.
        LOOP AT ltlines INTO DATA(walines).
            IF schemecode <> walines-schemecode OR schemegroupcode <> walines-schemegroupcode.
                IF orderqty <> 0 and orderqty >= minimumqty.
                    insertTag = 1.
                    freeqtycalc = orderqty / schemeqty.
                    freeqty = floor( freeqtycalc ).
                    "insert so scheme & lines
                    create_soscheme = VALUE #( %cid      = ls_key-%cid
                                    Bukrs = companycode
                                    Salesorder = salesorder
                                    Schemecode = schemecode
                                    Schemegroupcode = schemegroupcode
                                    Schemecheckcode = schemecheckcode
                                    Orderqty = orderqty
                                    Freeqty = freeqty
                                    Appliedqty = 0
                                    ).
                    APPEND create_soscheme TO create_soschemetab.

                    MODIFY ENTITIES OF ZR_zsoscheme01TP IN LOCAL MODE
                    ENTITY zsoscheme
                    CREATE FIELDS ( bukrs salesorder schemecode schemegroupcode schemecheckcode orderqty freeqty appliedqty )
                          WITH create_soschemetab
                    MAPPED   mapped
                    FAILED   failed
                    REPORTED reported.

                    SELECT FROM zschemelines as schline
                        FIELDS schline~schemecode, schline~schemegroupcode, schline~productcode
                    WHERE schline~bukrs = @companycode and schline~schemecode = @schemecode and schline~schemegroupcode = @schemegroupcode
                    ORDER BY schline~productcode
                        INTO TABLE @DATA(ltschlines).

                    LOOP AT ltschlines INTO DATA(waschlines).
                        productdesc = ''.
                        SELECT FROM I_ProductDescription as pd
                            FIELDS pd~Product, pd~ProductDescription
                            WHERE pd~Product = @waschlines-productcode and pd~LanguageISOCode = 'EN'
                            INTO TABLE @DATA(Itlines).
                        DATA: ls_Itlines LIKE LINE OF Itlines.

                        READ TABLE Itlines WITH KEY Product = waschlines-productcode
                                    INTO ls_Itlines.
                        IF sy-subrc = 0.
                          productdesc = ls_Itlines-ProductDescription.
                        ENDIF.


                        create_soschemeline = VALUE #( %cid      = ls_key-%cid
                                        Bukrs = companycode
                                        Salesorder = salesorder
                                        Schemecode = schemecode
                                        Schemegroupcode = schemegroupcode
                                        Schemecheckcode = schemecheckcode
                                        Productcode = waschlines-productcode
                                        Productdesc = productdesc
                                        Freeqty = 0
                                        ).
                        APPEND create_soschemeline TO create_soschemelinetab.

                        MODIFY ENTITIES OF ZR_soschlines
                        ENTITY ZR_soschlines
                        CREATE FIELDS ( bukrs salesorder schemecode schemegroupcode schemecheckcode  Productcode Productdesc freeqty )
                              WITH create_soschemelinetab.

                        CLEAR : create_soschemeline.
                        CLEAR : create_soschemelinetab.
                    ENDLOOP.

                    CLEAR : create_soscheme.
                    CLEAR : create_soschemetab.

                ENDIF.

                schemecode = walines-schemecode.
                schemegroupcode = walines-schemegroupcode.
                schemecheckcode = |{ walines-schemecode }| & |-| & |{ walines-schemegroupcode }|.
                schemeqty = walines-schemeqty.
                freeqty = walines-freeqty.
                minimumqty = walines-minimumqty.
                orderqty = 0.
            ENDIF.

            SELECT FROM I_SalesOrderItem as sl
            FIELDS sum( sl~OrderQuantity )
            WHERE sl~SalesOrder = @salesorder
                AND sl~Product = @walines-productcode
                INTO @DATA(soqty).

            IF sy-subrc = 0.
                orderqty = orderqty + soqty.
            ENDIF.
        ENDLOOP.
        IF orderqty <> 0 and orderqty >= minimumqty.
            "insert so scheme & lines
            inserttag = 1.
            freeqtycalc = orderqty / schemeqty.
            freeqty = floor( freeqtycalc ).
            create_soscheme = VALUE #( %cid      = ls_key-%cid
                            Bukrs = companycode
                            Salesorder = salesorder
                            Schemecode = schemecode
                            Schemegroupcode = schemegroupcode
                            Schemecheckcode = schemecheckcode
                            Orderqty = orderqty
                            Freeqty = freeqty
                            Appliedqty = 0
                            ).
            APPEND create_soscheme TO create_soschemetab.

            MODIFY ENTITIES OF ZR_zsoscheme01TP IN LOCAL MODE
            ENTITY zsoscheme
            CREATE FIELDS ( bukrs salesorder schemecode schemegroupcode schemecheckcode orderqty freeqty appliedqty )
                  WITH create_soschemetab
            MAPPED   mapped
            FAILED   failed
            REPORTED reported.

            SELECT FROM zschemelines as schline
                FIELDS schline~schemecode, schline~schemegroupcode, schline~productcode
            WHERE schline~bukrs = @companycode and schline~schemecode = @schemecode and schline~schemegroupcode = @schemegroupcode
            ORDER BY schline~productcode
                INTO TABLE @DATA(ltschlines2).

            LOOP AT ltschlines2 INTO DATA(waschlines2).
                productdesc = ''.
                SELECT FROM I_ProductDescription as pd
                    FIELDS pd~Product, pd~ProductDescription
                    WHERE pd~Product = @waschlines2-productcode and pd~LanguageISOCode = 'EN'
                    INTO TABLE @DATA(Itlines2).
                DATA: ls_Itlines2 LIKE LINE OF Itlines2.

                READ TABLE Itlines2 WITH KEY Product = waschlines2-productcode
                            INTO ls_Itlines2.
                IF sy-subrc = 0.
                  productdesc = ls_Itlines2-ProductDescription.
                ENDIF.


                create_soschemeline = VALUE #( %cid      = ls_key-%cid
                                Bukrs = companycode
                                Salesorder = salesorder
                                Schemecode = schemecode
                                Schemegroupcode = schemegroupcode
                                Schemecheckcode = schemecheckcode
                                Productcode = waschlines2-productcode
                                Productdesc = productdesc
                                Freeqty = 0
                                ).
                APPEND create_soschemeline TO create_soschemelinetab.

                MODIFY ENTITIES OF ZR_soschlines
                ENTITY ZR_soschlines
                CREATE FIELDS ( bukrs salesorder schemecode schemegroupcode schemecheckcode Productcode Productdesc freeqty )
                      WITH create_soschemelinetab.

                CLEAR : create_soschemeline.
                CLEAR : create_soschemelinetab.
            ENDLOOP.


        ENDIF.
        IF inserttag = 0.
            create_soscheme = VALUE #( %cid      = ls_key-%cid
                            Bukrs = companycode
                            Salesorder = salesorder
                            Schemecode = 'NA'
                            Schemegroupcode = 'NA'
                            Schemecheckcode = 'NA'
                            Orderqty = 0
                            Freeqty = 0
                            Appliedqty = 0
                            ).
            APPEND create_soscheme TO create_soschemetab.

            MODIFY ENTITIES OF ZR_zsoscheme01TP IN LOCAL MODE
            ENTITY zsoscheme
            CREATE FIELDS ( bukrs salesorder schemecode schemegroupcode schemecheckcode orderqty freeqty appliedqty )
                  WITH create_soschemetab
            MAPPED   mapped
            FAILED   failed
            REPORTED reported.

        ENDIF.


        APPEND VALUE #( %cid = ls_key-%cid
                        %msg = new_message_with_text(
                        severity = if_abap_behv_message=>severity-success
                        text     = 'Success.' )
                        ) TO reported-zsoscheme.
        RETURN.
    ENDLOOP.

  ENDMETHOD.

ENDCLASS.
