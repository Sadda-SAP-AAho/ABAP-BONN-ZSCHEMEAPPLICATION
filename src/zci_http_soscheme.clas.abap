CLASS zci_http_soscheme DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC .

  PUBLIC SECTION.

     INTERFACES if_http_service_extension.
    METHODS: validateschemes IMPORTING
            saleorder TYPE string
            bukrs TYPE string
            RETURNING VALUE(html) TYPE string.
  PROTECTED SECTION.
  PRIVATE SECTION.
    DATA: LS_SO_TEMP_KEY              TYPE STRUCTURE FOR KEY OF i_salesordertp.
ENDCLASS.



CLASS ZCI_HTTP_SOSCHEME IMPLEMENTATION.


  METHOD if_http_service_extension~handle_request.

    DATA(req_method) = request->get_method( ).

    CASE req_method.

      WHEN CONV string( if_web_http_client=>post ).
        DATA(saleorder) = request->get_form_field( `salesorder` ).
        DATA(bukrs) = request->get_form_field( `bukrs` ).
        response->set_text( validateschemes( saleorder = saleorder
                                            bukrs = bukrs ) ).

    ENDCASE.

  ENDMETHOD.


  METHOD validateschemes.

    DATA: lv_string TYPE STRING.

*    Run Validations
    SELECT sum( a~Freeqty ) as Freeqty, a~Schemecode, a~Schemegroupcode
        FROM ZR_zsoscheme01TP as a
        WHERE a~Salesorder = @saleorder
              AND a~Bukrs = @bukrs
        GROUP BY Schemecode,Schemegroupcode
        INTO TABLE @DATA(soschemes) .

     LOOP AT soschemes INTO DATA(wa_soscheme).

        SELECT SINGLE FROM ZR_zsoschemelinesTP as a
        FIELDS sum( a~Freeqty ) as Freeqty
        WHERE a~Salesorder = @saleorder AND a~Bukrs = @bukrs and a~Schemecode = @wa_soscheme-Schemecode
             and a~Schemegroupcode = @wa_soscheme-Schemegroupcode
        INTO  @DATA(schemelines) .


        IF schemelines NE wa_soscheme-freeqty.
            html = |Free Qty Mismatch for  Scheme { wa_soscheme-Schemecode } Group { wa_soscheme-Schemegroupcode } |.
        ENDIF.

     ENDLOOP.

*     select from ZR_zsoschemelinesTP
*     fields Freeqty, Schemecode, Schemecheckcode, Productcode
*     where Bukrs = @bukrs and Salesorder = @saleorder and Freeqty > 0
*     into Table @DATA(lines).
*
*     select single from I_SalesOrderItemTP
*     fields Plant
*     where SalesOrder = @saleorder and SalesOrganization = @bukrs
*     into @DATA(Plant).
*
*
*
*
*     Read ENTITIES OF i_salesordertp
*            ENTITY  SalesOrder
*            ALL FIELDS WITH VALUE #( ( %key-SalesOrder = saleorder ) )
*            MAPPED DATA(ls_mapped2)
*                     FAILED DATA(ls_failed2)
*                     REPORTED DATA(ls_reported2).
*
*
*
*            SalesOrder
*             CREATE
*            FIELDS ( salesordertype
*                   salesorganization distributionchannel organizationdivision
*                     soldtoparty purchaseorderbycustomer CustomerPaymentTerms )
*            WITH VALUE #( ( %cid = 'H001'
*                            %data = VALUE #(      salesordertype = 'TA'
*                                                  salesorganization = 'BB00'
*                                                  distributionchannel = 'GT'
*                                                  organizationdivision = 'B1'
*                                                  soldtoparty = |{ '11000384' ALPHA = IN }|
*                                                  purchaseorderbycustomer = 'Group Scheme'
*                                                  CustomerPaymentTerms = '0001'
*                                              ) ) )
*
*            CREATE BY \_Item
*            Fields ( Product RequestedQuantity YY1_SchemeCode_SDI SalesOrderItemCategory  )
*             WITH VALUE #( ( %cid_ref = 'H001'
*                  salesorder = space
*                  %target = VALUE #( FOR line IN lines INDEX INTO i (
*                    %cid =  |I{ i WIDTH = 3 ALIGN = RIGHT PAD = '0' }|
*                    Product =  line-Productcode
*                    RequestedQuantity =  line-Freeqty
*                    YY1_SchemeCode_SDI = line-Schemecheckcode
*                    SalesOrderItemCategory = 'CBXN'
*                   ) ) ) )
*                    MAPPED DATA(ls_mapped)
*                     FAILED DATA(ls_failed)
*                     REPORTED DATA(ls_reported).
*
*
*        COMMIT ENTITIES BEGIN
*         RESPONSE OF i_salesordertp
*         FAILED DATA(ls_save_failed)
*         REPORTED DATA(ls_save_reported).
*
*
*
**
*      CONVERT KEY OF i_salesordertp FROM LS_SO_TEMP_KEY TO DATA(ls_so_final_key) .
*
******salesordeitem conversion********
*
*      TYPES: BEGIN OF ty_salesorderitem_key,
*               salesorder     TYPE i_salesorderitemtp-salesorder,
*               salesorderitem TYPE i_salesorderitemtp-salesorderitem,
*             END OF ty_salesorderitem_key.
*
*      DATA: lt_so_item_temp_keys  TYPE TABLE OF ty_salesorderitem_key,
*            lt_so_item_final_keys TYPE TABLE OF ty_salesorderitem_key,
*            ls_so_item_temp_key   TYPE ty_salesorderitem_key,
*            ls_so_item_final_key  TYPE ty_salesorderitem_key.
*
*      LOOP AT ls_mapped-salesorderitem ASSIGNING FIELD-SYMBOL(<ls_mapped_item>).
*        MOVE-CORRESPONDING <ls_mapped_item> TO ls_so_item_temp_key.
*        APPEND ls_so_item_temp_key TO lt_so_item_temp_keys.
*      ENDLOOP.
*
*      LOOP AT lt_so_item_temp_keys INTO ls_so_item_temp_key.
*        CONVERT KEY OF i_salesorderitemtp FROM ls_so_item_temp_key TO ls_so_item_final_key.
*        APPEND ls_so_item_final_key TO lt_so_item_final_keys.
*      ENDLOOP.
**
*        COMMIT ENTITIES END.


  ENDMETHOD.
ENDCLASS.
